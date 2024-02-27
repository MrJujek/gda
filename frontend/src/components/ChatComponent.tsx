import { useEffect, useState, useRef } from "react";
import Picker from "emoji-picker-react";

interface Message {
	text: string;
}

function ChatComponent() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const socket = new WebSocket(`ws://localhost:3000/api/chat`);
		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			setMessages((prevMessages) => [...prevMessages, message]);
		};
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Here you would handle sending the message through the WebSocket
		console.log(inputValue);
		setInputValue(""); // Clear the input after sending the message
	};

	const onEmojiClick = (event, emojiObject) => {
		setInputValue((prevInputValue) => prevInputValue + emojiObject.emoji);
	};

	const handleFileButtonClick = () => {
		fileInputRef.current.click();
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
					value={inputValue}
					onChange={handleInputChange}
					className="flex-grow mx-2 resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					rows={1}
					placeholder="Type your message here..."
					style={{ minWidth: "0" }}
				></textarea>
				<button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
					{" "}
					Send{" "}
				</button>
			</form>
			{emojiPickerOpen && (
				<div className="absolute bottom-full mb-2 left-0">
					<Picker onEmojiClick={onEmojiClick} />
				</div>
			)}
			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
		</div>
	);
}

export default ChatComponent;
