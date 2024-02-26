import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import Logout from "../components/Logout";
import UserAutocomplete from "../components/UserAutocomplete.tsx";
import GroupAutocomplete from "../components/GroupAutocomplete.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import logo from "../assets/GDA-logos.webp";

type User = {
  id: number;
  CommonName: string;
  DisplayName: {
    String: string;
    Valid: boolean;
  };
  Active: boolean;
};

type Chat = {
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
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [userId, setUserId] = useState<number>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(true);
  const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    (async () => {
      if (selectedUser) {
        const response = await fetch("/api/chat/", {
          method: "POST",
          body: JSON.stringify({ UserIds: [userId, selectedUser.id] }),
        });

        console.log("response", response);

        if (response.ok) {
          (async () => {
            const response = await fetch("/api/my/chats", {
              method: "GET",
            });
            const data = await response.json();
            setChats(data);
          })();
        }
      }
    })();
  }, [selectedUser]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/users", {
        method: "GET",
      });
      const data = (await response.json()) as User[];

      setUserId(
        data.find((user) => user.CommonName === sessionStorage.getItem("name"))!
          .id
      );

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
    <div className="flex flex-col h-screen bg-gray-200">
      {/* Navigation Menu */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md border-b-2 border-gray-300">
        {/* Logo */}
		<img src={logo} alt="Logo" className="h-8 mr-4" />        
        {/* Search Components and Actions */}
        <div className="flex-grow flex justify-between items-center">
          <div className="flex space-x-4">
            <UserAutocomplete placeholder="Search users" options={users} setSelected={setSelectedUser} currentUserId={userId!} />
            <GroupAutocomplete placeholder="Search groups" options={chats} setSelected={setSelectedGroup} />
          </div>
          
          <div className="flex space-x-4">
          <Logout />
          <ThemeToggle setDarkMode={setDarkMode}></ThemeToggle>
        </div>
      </div>
	</div>
      <div className="flex h-screen bg-gray-200">
        <div className="w-64 bg-white p-4 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Czaty</h2>
          {/* Users Dropdown */}
          <div className="mb-2">
            <button
              className="w-full text-left flex justify-between items-center"
              onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
            >
              Użytkownicy
              <svg
                className={`w-4 h-4 transition-transform ${isUsersDropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isUsersDropdownOpen && (
              <div className="mt-2">
                {users && users.map((user) => (
                  <div key={user.id} className="p-2 hover:bg-gray-100">
                    {user.CommonName}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Groups Dropdown */}
          {chats &&
            <div className="mb-2">
            <button
              className="w-full text-left flex justify-between items-center"
              onClick={() => setIsGroupsDropdownOpen(!isGroupsDropdownOpen)}
            >
              Grupy
              <svg
                className={`w-4 h-4 transition-transform ${isGroupsDropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isGroupsDropdownOpen && (
              <div className="mt-2">
                {chats && chats.map((chat) => (
                  <div key={chat.ChatUUI} className="p-2 hover:bg-gray-100">
                    {chat.GroupName.String}
                  </div>
                ))}
              </div>
            )}
          </div>}
          {/* {users && users.map((user: User) => {
            if (user.CommonName === sessionStorage.getItem("name")) {
              return null;
            }
            return (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer">
                <div>
                  <h3 className="font-semibold">{user.CommonName}</h3>
                  <p className="text-sm text-gray-500">Private chat</p>
                </div>
              </div>
            );
          })}
          {chats && chats.map((chat: Chat) => {
            return (
              <div key={chat.ChatUUI} className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer">
                <div>
                  <h3 className="font-semibold">{chat.GroupName.String}</h3>
                  <p className="text-sm text-gray-500">Group chat</p>
                </div>
              </div>
            );
          })} */}
        </div>
      </div>
    </div>
  );
}

export default Chat;