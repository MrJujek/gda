import { useState, FormEvent } from 'react';
import { useNavigate } from "react-router-dom";

function SignIn() {
    const [name, setName] = useState<string>('');
    const [pass, setPass] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        // Handle sign-in logic here
        console.log(`Email: ${name}, Password ${pass}`);

        const res = await fetch("/api/session", {
            method: "POST",
            body: JSON.stringify({
                user: name,
                pass: pass
            })
        })

        if (!res.redirected) {
            // statusEl.style.color = "red";
            // statusEl.innerText = res.statusText;
            console.error(res.statusText);
        } else {
            sessionStorage.setItem("pass", pass)
            
            if (res.url.includes("chat")) {
                navigate("/chat");
            } else {
                navigate("/keys");
            }
        }

        // console.log(res)
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-6 bg-white rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-5 text-gray-800">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2">
                        Email:
                        <input type="text" value={name} onChange={(e) => setName(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <label className="block mb-4">
                        Password:
                        <input type="password" value={pass} onChange={(e) => setPass(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;