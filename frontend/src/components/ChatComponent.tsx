import { useEffect, useState, useRef } from "react";
import { type Chat, type User } from "../pages/Chat";
import { EmojiPicker } from "./EmojiPicker";
import TextareaAutosize from "react-textarea-autosize";
import { useAuth } from "../contexts/AuthContext";

type MsgType = "text" | "activity" | "image";

type Message = {
	Id: number;
	AuthorId: number;
	Timestamp: string;
	MsgType: MsgType;
	Encrypted: boolean;
	Text: string;
	FileUUID: string | null;
};

type PostChatRequest =
	| {
			Type: "message";
			Data: {
				ChatUUID: string;
				Text: string;
				MsgType: MsgType;
				Encrypted: boolean;
			};
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  }
	| {
			Type: "message";
			Data: {
				ChatUUID: string;
				FileUUID: string;
				MsgType: MsgType;
				Encrypted: boolean;
			};
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  };

type ChatResponse = {
	Type: "message";
	Data: Message;
};

interface Props {
	user: User | null;
	chat: Chat | null;
	chatId: string | null;
}
function ChatComponent(props: Props) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState<string>("");
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const socketRef = useRef<WebSocket | null>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fileUUID, setFileUUID] = useState<string | null>(null);

	const { loggedIn } = useAuth();
	const [userId, setUserId] = useState<number | null>(null);

	function onReceiveMessage(e: MessageEvent) {
		const res = JSON.parse(e.data) as ChatResponse;
		setMessages((prev) => [...prev, res.Data]);
		// Wait until the message is rendered and then scroll to the bottom
		setTimeout(() => messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current?.scrollHeight));
	}
	useEffect(() => {
		(async () => {
			const url = new URL(window.location.href);
			url.pathname = "/api/chat";
			if (url.protocol == "https:") {
				url.protocol = "wss:";
			} else {
				url.protocol = "ws:";
			}

			setUserId(await loggedIn());

			socketRef.current = new WebSocket(url.href);
			socketRef.current.addEventListener("message", onReceiveMessage);

			// Scroll to the bottom of the messages container
			messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current?.scrollHeight);

			return () => {
				socketRef.current?.close();
			};
		})();
	}, [loggedIn]);

	async function fetchMessages() {
		if (props.chatId) {
			const res = await fetch(`/api/chat/messages?chat=${props.chatId}`);
			const text = await res.text();

			if (text === "null") {
				setMessages([]);
			} else {
				const json = JSON.parse(text) as Message[];
				setMessages(json);
			}
		}
	}
	useEffect(() => {
		fetchMessages();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.chat, props.user]);

	const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
		(async () => {
			if (selectedFile && props.chatId) {
				const formData = new FormData();
				formData.append("file", selectedFile);
				formData.append("chat-uuid", props.chatId!);

				const response = await fetch("/api/file", {
					method: "POST",
					body: formData,
				});
				const json = await response.json();

				setFileUUID(json.UUID);
			}
		})();

		event?.preventDefault();
		setInputValue(""); // Clear the input after sending the message
		socketRef.current?.send(
			JSON.stringify({
				Type: "message",
				Data: {
					ChatUUID: props.chatId!,
					Text: inputValue,
					MsgType: "text",
					Encrypted: false,
				},
			} satisfies PostChatRequest)
		);

		if (fileUUID) {
			socketRef.current?.send(
				JSON.stringify({
					Type: "message",
					Data: {
						ChatUUID: props.chatId!,
						FileUUID: fileUUID,
						MsgType: "image",
						Encrypted: false,
					},
				} satisfies PostChatRequest),
			);
		}
	};

	const onEmojiClick = (emojiObject: { emoji: string }) => {
		setInputValue((prevInputValue) => prevInputValue + emojiObject.emoji);
	};

	const handleFileButtonClick = () => {
		fileInputRef.current!.click();
	};

	useEffect(() => {
		console.log("selectedFile", selectedFile);

		if (selectedFile?.type.startsWith("image")) {
			console.log("image");

			const reader = new FileReader();
			reader.onloadend = () => {
				const base64 = reader.result;
				console.log(base64);
			};
			reader.readAsDataURL(selectedFile);
		} else if (selectedFile) {
			console.log("not image");
		}
	}, [selectedFile]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setSelectedFile(event.target.files[0]);
		}
	};

	return (
		<div className="flex flex-col justify-between w-full dark:text-white px-5 py-3 ">
			<div ref={messagesContainerRef} className="overflow-auto">
				<ul className="px-4 py-2 space-y-2">
					{messages.map((message, index) => (
						<li
							key={index}
							className={`${message.AuthorId !== userId ? "bg-white dark:bg-slate-900 dark:text-white" : "ml-auto bg-blue-500 text-white"} w-fit rounded-lg px-2 py-1 h-fit text-lg`}
						>
							{message.Text}
						</li>
					))}
				</ul>
			</div>

			<form
				onSubmit={handleSubmit}
				className="sticky bottom-0 flex items-center p-2 bg-white border-t w-full dark:bg-gray-500"
			>
				<button
					type="button"
					onClick={handleFileButtonClick}
					className="px-4 py-2 bg-gray-300 border-r border-gray-200 dark:bg-gray-300 rounded"
				>
					<svg
								className="w-6 h-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="#000"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
							</svg>
				</button>

				<button
					type="button"
					onClick={() => {
						setEmojiPickerOpen((prevOpen) => !prevOpen);
						console.log("emojiPickerOpen", emojiPickerOpen);
					}}
					className="px-4 py-2 bg-gray-300 border-l border-gray-200 m-1 dark:bg-gray-300 rounded"
				>
					{" 😊 "}
				</button>

				{emojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}

				{selectedFile?.type.startsWith("image") && (
					<img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-10 h-10 rounded" />
				)}

				<TextareaAutosize
					className="flex-grow mx-2 resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full dark:bg-gray-500"
					rows={1}
					placeholder="Aa"
					style={{ minWidth: "0" }}
					onChange={(e) => setInputValue(e.target.value)}
					maxRows={5}
					value={inputValue}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit();
						}
					}}
				/>

				<button
					type="submit"
					className="text-white bg-cornflower-blue border border-red-500 px-6 py-2 rounded-lg hover:bg-dark-cornflower-blue hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
					style={{ backgroundColor: "#6495ed", borderColor: "#ffffff" }}
				>
					Wyślij
				</button>
			</form>

			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
		</div>
	);
}

export default ChatComponent;
