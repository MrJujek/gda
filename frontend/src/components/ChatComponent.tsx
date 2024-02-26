import { useEffect, useState } from "react";

interface Message {
    text: string;
}

function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = new WebSocket(`ws://localalhost:3000/api/chat`)

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
    };
  }, []);

  return (
    <div className="m-1 rounded bg-white w-full">
        Wiadomości
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}
export default ChatComponent;