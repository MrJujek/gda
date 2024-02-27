import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import Logout from "../components/Logout";
import Autocomplete from "../components/Autocomplete";
import ThemeToggle from "../components/ThemeToggle.tsx";
import logo from "../assets/logo.svg";
import AccessToggle from "../components/AccessToggle.tsx";
import ChatComponent from "../components/ChatComponent.tsx";
import StatusIcon from "../components/StatusIcon";
import { userOrChat } from "../utils.ts";
import UserPhoto from "../components/UserPhoto.tsx";

export type User = {
	ID: number;
	ChatUUI: string;
	CommonName: string;
	DisplayName: {
		String: string;
		Valid: boolean;
	};
	Active: boolean;
};

export type Chat = {
	ChatUUI: string;
	Encrypted: boolean;
	Group: boolean;
	GroupName: {
		String: string;
		Valid: boolean;
	};
};

function Chat() {
	const navigate = useNavigate();
	const { loggedIn, logout } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [chats, setChats] = useState<Chat[]>([]);
	const [userId, setUserId] = useState<number>();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(true);
	const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);
	const [isChatVisible, setIsChatVisible] = useState(false);
	const [isLogoutVisible, setIsLogoutVisible] = useState(false);

	const toggleChat = () => {
		setIsChatVisible(!isChatVisible);
	};

	const toggleLogout = () => {
		setIsLogoutVisible(!isLogoutVisible);
	};

	useEffect(() => {
		(async () => {
			const logged = await loggedIn();
			if (!logged) {
				logout();
			}
		})();
	}, [loggedIn, logout, navigate]);

	useEffect(() => {
		toggleChat();
		toggleLogout();
	}, [selectedUser, selectedChat]);

	useEffect(() => {
		(async () => {
			const response = await fetch("/api/users", {
				method: "GET",
			});
			const data = (await response.json()) as User[];

			setUserId(data.find((user) => user.CommonName === sessionStorage.getItem("name"))!.ID);

			setUsers(data);
		})();

		(async () => {
			const response = await fetch("/api/my/chats", {
				method: "GET",
			});
			const data = await response.json();
			
			setChats(data.filter((chat:Chat) => chat.Group === true));
			console.log("data", data);
			console.log("chats", chats);
			
		})();
	}, []);

	return (
		<div className="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
			<div className="z-50 sticky top-0 flex justify-between items-center p-4 bg-white shadow-md border-b-2 border-gray-300 dark:bg-gray-800">
				<img
					src={logo}
					alt="Logo"
					className="h-8 mr-4"
					onClick={() => {
						toggleLogout();
						toggleChat();
					}}
				/>

				<div className="flex-grow flex justify-between items-center">
					<div className="flex space-x-4">
						<Autocomplete
							currentUserId={userId!}
							options={(chats ? [...users, ...chats] : [...users]) as (User | Chat)[]}
							setSelectedOption={(option) => {
								if (option === null) {
									return;
								}

								// @ts-expect-error asdasd
								if (userOrChat(option) === "user") {
									setSelectedUser(option as User);
									// @ts-expect-error asdasd
								} else if (userOrChat(option) === "chat") {
									setSelectedChat(option as Chat);
								}
							}}
						/>
						<button
							className="p-2 dark:text-black  text-left flex justify-between items-center hover:bg-gray-100 cursor-pointer dark:text-white"
							onClick={() => {
								/* Handle click event for new action */
							}}
						>
							<svg
								className="w-6 h-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
							</svg>
						</button>
					</div>

					<div className="flex space-x-4">
						<div className="hidden sm:block">
							<Logout />
						</div>
						<ThemeToggle></ThemeToggle>
						<AccessToggle></AccessToggle>
					</div>
				</div>
			</div>
			<div className="flex h-screen bg-gray-200 dark:bg-gray-800 ">
				<div
					className={`${
						isChatVisible ? "block" : "hidden"
					} absolute sm:relative h-full w-screen z-10 sm:z-0 sm:w-64 bg-white p-4 shadow-lg border-r border-b-2 border-gray-300 dark:bg-gray-800 sm:block`}
				>
					<h2 className="text-2xl font-bold mb-4 dark:text-white">Czaty</h2>

					{users && (
						<div className="mb-2">
							<button
								className="w-full text-left flex justify-between items-center dark:text-white"
								onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
							>
								Użytkownicy
								<svg
									className={`w-4 h-4 transition-transform  ${
										isUsersDropdownOpen ? "rotate-180" : ""
									} `}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
							{isUsersDropdownOpen && (
								<div className="mt-2" key={"users"}>
									{users.length > 0 &&
										users.map((user) => {
											if (user.ID === userId) {
												return;
											}

											return (
												<div
													key={user.ID}
													className="rounded flex items-center px-4 py-2 hover:bg-gray-500 cursor-pointer dark:text-white"
													onClick={async () => {
														const response = await fetch("/api/chat", {
															method: "POST",
															body: JSON.stringify({ UserIds: [user.ID] }),
														});
														const chatId = await response.text();
														setSelectedChatId(chatId);
														setSelectedUser(user);
													}}
												>
													<UserPhoto userID={user.ID} />
													<StatusIcon
														active={
															users.find((user1) => user1.CommonName == user.CommonName)
																?.Active || false
														}
													/>
													<span className="ml-2">{user.CommonName}</span>
												</div>
										)})}
								</div>
							)}
						</div>
					)}

					{chats.length > 0 && (
						<div className="mb-2">
							<button
								className="w-full text-left flex justify-between items-center dark:text-white"
								onClick={() => setIsGroupsDropdownOpen(!isGroupsDropdownOpen)}
							>
								Grupy
								<svg
									className={`w-4 h-4 transition-transform ${
										isGroupsDropdownOpen ? "rotate-180" : ""
									}`}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>

							{isGroupsDropdownOpen && (
								<div className="mt-2" key={"groups"}>
									{chats &&
										chats.map((chat) => {
											if (chat.Group === true) {
												return (
													<div
														key={chat.ChatUUI}
														className="p-2 hover:bg-gray-100 cursor-pointer"
														onClick={() => {
															setSelectedChatId(chat.ChatUUI);
															setSelectedChat(chat);
														}}
													>
														{chat.GroupName.String}
													</div>
												)		
											}
										})
									}
								</div>
							)}
						</div>
					)}
				</div>

				<ChatComponent user={selectedUser} chat={selectedChat} chatId={selectedChatId} />
			</div>
		</div>
	);
}

export default Chat;