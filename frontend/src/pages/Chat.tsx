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
import UserPhoto from "../components/UserPhoto.tsx";

export type User = {
	ID: number;
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
	const [selectedOption, setSelectedOption] = useState<User | Chat | null>(null);
	const [betterAccess, setBetterAccess] = useState(false);
	const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(true);
	const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);

	useEffect(() => {
		(async () => {
			const logged = await loggedIn();
			if (!logged) {
				logout();
			}
		})();
	}, [loggedIn, logout, navigate]);

	useEffect(() => {
		console.log("creating chat - selectedOption", selectedOption);

		(async () => {
			if (selectedOption && typeof selectedOption.ID === "number") {
				const selectedUser = selectedOption as User;
				const response = await fetch("/api/chat", {
					method: "POST",
					body: JSON.stringify({ UserIds: [selectedUser.ID] }),
				});
				const chatId = await response.text();

				const messages = await fetch(`/api/chat/messages?chat=${chatId}`);
				console.log(await messages.json());
			}
		})();

		(async () => {
			const response = await fetch("/api/my/chats", {
				method: "GET",
			});

			const data = await response.json();

			console.log("data", data);

			setChats(data);
		})();
	}, [selectedOption]);

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
			setChats(data);
			console.log("chats", data);
		})();
	}, []);

	return (
		<div className="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
			<div className="flex justify-between items-center p-4 bg-white shadow-md border-b-2 border-gray-300 dark:bg-gray-800">
				<img src={logo} alt="Logo" className="h-8 mr-4" />

				<div className="flex-grow flex justify-between items-center">
					<div className="flex space-x-4">
						<Autocomplete
							currentUserId={userId!}
							options={(chats ? [...users, ...chats] : [...users]) as (User | Chat)[]}
							setSelectedOption={setSelectedOption}
						/>
					</div>

					<div className="flex space-x-4">
						<Logout />
						<ThemeToggle></ThemeToggle>
						<AccessToggle setBetterAccess={setBetterAccess}></AccessToggle>
					</div>
				</div>
			</div>
			<div className="flex h-screen bg-gray-200 dark:bg-gray-800 ">
				<div className="w-64 bg-white p-4 shadow-lg border-r border-b-2 border-gray-300 dark:bg-gray-800 ">
					<h2 className="text-2xl font-bold mb-4">Czaty</h2>

					{users && (
						<div className="mb-2">
							<button
								className="w-full text-left flex justify-between items-center"
								onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
							>
								Użytkownicy
								<svg
									className={`w-4 h-4 transition-transform ${
										isUsersDropdownOpen ? "rotate-180" : ""
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
							{isUsersDropdownOpen && (
								<div className="mt-2" key={"users"}>
									{users &&
										users.map((user) => (
											<div
												key={user.ID}
												className="rounded flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
												onClick={() => {
													setSelectedOption(user);
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
										))}
								</div>
							)}
						</div>
					)}

					{chats && (
						<div className="mb-2">
							<button
								className="w-full text-left flex justify-between items-center"
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
										chats.map((chat) => (
											<div
												key={chat.ChatUUI}
												className="p-2 hover:bg-gray-100 cursor-pointer"
												onClick={() => {
													setSelectedOption(chat);
												}}
											>
												{chat.GroupName.String}
											</div>
										))}
								</div>
							)}
						</div>
					)}
				</div>

				<ChatComponent option={selectedOption} />
			</div>
		</div>
	);
}

export default Chat;
