import { useEffect, useState, useRef } from "react";
import { type Chat, type User } from "../pages/Chat";
import { EmojiPicker } from "./EmojiPicker";
import TextareaAutosize from "react-textarea-autosize";

type MsgType = "text" | "activity";

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

	function onReceiveMessage(e: MessageEvent) {
		const res = JSON.parse(e.data) as ChatResponse;
		setMessages((prev) => [...prev, res.Data]);
		// Wait until the message is rendered and then scroll to the bottom
		setTimeout(() => messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current?.scrollHeight));
	}
	useEffect(() => {
		const url = new URL(window.location.href);
		url.pathname = "/api/chat";
		if (url.protocol == "https:") {
			url.protocol = "wss:";
		} else {
			url.protocol = "ws:";
		}

		socketRef.current = new WebSocket(url.href);
		socketRef.current.addEventListener("message", onReceiveMessage);

		// Scroll to the bottom of the messages container
		messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current?.scrollHeight);

		return () => {
			socketRef.current?.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			} satisfies PostChatRequest),
		);
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
			<div ref={messagesContainerRef} className="overflow-auto">
				Wiadomości
				<ul>
					{messages.map((message, index) => (
						<li key={index}>{message.Text}</li>
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
					{" + "}
				</button>

				<button
					type="button"
					onClick={() => {
						setEmojiPickerOpen((prevOpen) => !prevOpen);
						console.log("emojiPickerOpen", emojiPickerOpen);
					}}
					className="px-4 py-2 bg-gray-300 border-l border-gray-200"
				>
					{" 😊 "}
				</button>

				{emojiPickerOpen && 
					<EmojiPicker onEmojiClick={onEmojiClick} />
				}

				<TextareaAutosize
					className="flex-grow mx-2 resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
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
