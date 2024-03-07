import { Chat, User } from "./pages/Chat";

export function userOrChat(option: User | Chat): "user" | "chat" {
	if (typeof (option as User).ID === "number") {
		return "user";
	} else {
		return "chat";
	}
}
