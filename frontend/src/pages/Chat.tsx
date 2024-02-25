import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import Logout from "../components/Logout";
import Autocomplete from "../components/Autocomplete.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";

type User = {
  id: string;
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
  const [chats, setChats] = useState([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);

  const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log("selected", selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    // Fetch users
    // Fetch groups
    // Fetch chats
    (async () => {
      const response = await fetch("/api/users", {
        method: "GET",
      });

      const data = await response.json();

      setUsers(data);
    })();

    (async () => {
      const response = await fetch("/api/my/chats", {
        method: "GET",
      });

      const data = await response.json();

      setChats(data);
    })();
  }, []);

  return (
    <>
      <div
        className={`flex flex-col h-screen ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <div
          className={`p-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md flex justify-start`}
        >
          <Autocomplete
            placeholder="Search users"
            options={users}
            setSelected={setSelectedUser}
          />
          <Autocomplete
            placeholder="Search groups"
            options={chats}
            setSelected={setSelectedGroup}
          />
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <Logout></Logout>
          <ThemeToggle></ThemeToggle>
        </div>

        <div
          className={`flex h-screen ${
            darkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          <div className="w-64 bg-white dark:bg-gray-700 p-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Chats</h2>
            <div className="mb-8">User 2</div>
          </div>

          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4">Chat</h2>
            {/* Replace with your actual chat */}
            <div className="border border-gray-300 p-4 rounded mb-4">
              Hello, world!
            </div>
            <div className="border border-gray-300 p-4 rounded mb-4">
              How are you?
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen bg-gray-200">
        <div className="p-4 bg-white shadow-md flex justify-start">
          <Autocomplete
            placeholder="Search users"
            options={users}
            setSelected={setSelectedUser}
          />
          <Autocomplete
            placeholder="Search groups"
            options={chats}
            setSelected={setSelectedGroup}
          />
          <button></button>
          <Logout></Logout>
        </div>

        <div className="flex h-screen bg-gray-200">
          <div className="w-64 bg-white p-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Chats</h2>

            <div className="mb-8">User 2</div>
          </div>

          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4">Chat</h2>
            {/* Replace with your actual chat */}
            <div className="border border-gray-300 p-4 rounded mb-4">
              Hello, world!
            </div>
            <div className="border border-gray-300 p-4 rounded mb-4">
              How are you?
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
