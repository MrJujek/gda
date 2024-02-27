import { useEffect, useState, useRef } from "react";
import { type Chat, type User } from "../pages/Chat";
import { EmojiPicker } from "./EmojiPicker";

interface Message {
	text: string;
}

interface Props {
	option: User | Chat | null;
}
function ChatComponent(props: Props) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState<string>("");
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const url = new URL(window.location.href);
		url.pathname = "/api/chat";
		url.protocol = "ws";

		const socket = new WebSocket(url.href);

		function open(event: Event) {
			console.log("WebSocket opened");
		}

		socket.addEventListener("open", open);
		return () => {
			socket.removeEventListener("open", open);
		};
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Handle form submission
		console.log(inputValue);
		setInputValue(""); // Clear the input after sending the message
	};

	const onEmojiClick = (emojiObject: { emoji: string }) => {
		setInputValue((prevInputValue) => prevInputValue + emojiObject.emoji);
	};

	const handleFileButtonClick = () => {
		fileInputRef.current!.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Handle file selection
		console.log(event.target.files);
	};

	return (
		<div className="flex flex-col justify-between w-full">
			<div className="overflow-auto">
				Wiadomości
				<ul>
					{messages.map((message, index) => (
						<li key={index}>{message.text}</li>
					))}
				</ul>
			</div>
			{/* Form with a textarea and buttons at the bottom */}
			<form onSubmit={handleSubmit} className="flex items-center p-2 bg-white border-t w-full relative">
				<button
					type="button"
					onClick={handleFileButtonClick}
					className="px-4 py-2 bg-gray-300 border-r border-gray-200"
				>
					{" "}
					+{" "}
				</button>
				<button
					type="button"
					onClick={() => setEmojiPickerOpen((prevOpen) => !prevOpen)}
					className="px-4 py-2 bg-gray-300 border-l border-gray-200"
				>
					{" "}
					😊{" "}
				</button>
				<textarea
					className="flex-grow mx-2 resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
					rows={1}
					placeholder="Aa"
					style={{ minWidth: "0" }}
				></textarea>
				<button
					type="submit"
					className="text-white bg-cornflower-blue border border-red-500 px-6 py-2 rounded-lg hover:bg-dark-cornflower-blue hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
					style={{ backgroundColor: "#6495ed", borderColor: "#ffffff" }}
				>
					Wyślij
				</button>
			</form>
			{emojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}
			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
		</div>
	);
}

export default ChatComponent;
