import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import words from "../assets/lista_slow.json";
import Logout from "../components/Logout";

function Keys() {
	const [keys, setKeys] = useState<string>("");

	const navigate = useNavigate();

	let base64PubKey: string, codePrivKey: string, passPrivKey: string;

	const wordNumber = 20;
	const iterations = 10000; // needs to be the same on server -> 10000
	const pass = sessionStorage.getItem("pass");

	if (pass == null) {
		navigate("/signin");

		return;
	}

	async function createKeys() {
		return await window.crypto.subtle.generateKey(
			{
				name: "ECDSA",
				namedCurve: "P-256",
			},
			true,
			["sign", "verify"],
		);
	}

	async function getWords() {
		const array = new Uint32Array(wordNumber);
		const selectedWords = [];

		window.crypto.getRandomValues(array);

		for (const num of array) {
			selectedWords.push(words[num % words.length]);
		}

		setKeys(selectedWords.join(" "));

		return selectedWords.join(" ");
	}

	async function getSalt() {
		// check for errors
		return await (await fetch("/api/my/salt")).arrayBuffer();
	}

	async function exportPubKey(pubKey: CryptoKey) {
		const keyBuffer = await window.crypto.subtle.exportKey("spki", pubKey);
		return keyBuffer;
	}

	async function exportPrivKey(privKey: CryptoKey) {
		const keyBuffer = await window.crypto.subtle.exportKey("pkcs8", privKey);
		return keyBuffer;
	}

	function bufToBase64(buf: ArrayBuffer) {
		return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buf))));
	}

	async function deriveDbKey(encText: string, salt: ArrayBuffer) {
		const enc = new TextEncoder();
		const dbEncKeyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(encText), "PBKDF2", false, [
			"deriveBits",
			"deriveKey",
		]);

		return await window.crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt,
				iterations,
				hash: "SHA-256",
			},
			dbEncKeyMaterial,
			{ name: "AES-GCM", length: 256 },
			true,
			["encrypt", "decrypt"],
		);
	}

	async function encryptEncKey(encText: string, salt: ArrayBuffer, data: ArrayBuffer) {
		const dbEncKey = await deriveDbKey(encText, salt);

		// salt here is actually iv, but for simplicity we will use the same values
		const buf = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: salt }, dbEncKey, data);

		return bufToBase64(buf);
	}

	useEffect(() => {
		async function qwe() {
			const words = await getWords();
			const salt = await getSalt();
			const encKey = await createKeys();

			base64PubKey = bufToBase64(await exportPubKey(encKey.publicKey));
			const exportedPrivKey = await exportPrivKey(encKey.privateKey);

			codePrivKey = await encryptEncKey(words, salt, exportedPrivKey);
			passPrivKey = await encryptEncKey(pass!, salt, exportedPrivKey);
		}
		qwe();
	}, []);

	async function sendKeys() {
		await fetch("/api/my/keys", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				PublicKey: base64PubKey,
				PassPrivateKey: passPrivKey,
				CodePirvateKey: codePrivKey,
			}),
		});

		sessionStorage.removeItem("pass");

		Logout();
	}

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="text-center">
				<h1 className="text-6xl font-semibold">Klucz bezpieczeństwa</h1>
				<p className="text-xl mt-4">{keys}</p>
				<br />

				<button
					onClick={() => sendKeys()}
					className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					Zapisałem klucz bezpieczeństwa
				</button>
			</div>
		</div>
	);
}

export default Keys;
