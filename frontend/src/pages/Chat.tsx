import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import Logout from "../components/Logout";
import Autocomplete from "../components/Autocomplete.tsx";

type User = {
    id: number;
    CommonName: string;
    DisplayName: {
        String: string;
        Valid: boolean;
    }
    Active: boolean;
}

type Chat = {
    ChatUUI: string;
    Encrypted: boolean;
    Group: boolean;
    GroupName: {
        String: string;
        Valid: boolean;
    }
}

function Chat() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [chats, setChats] = useState([]);
    const [userId, setUserId] = useState<number>();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        (async () => {
            if (selectedUser) {
                const response = await fetch("/api/chat/", {
                    method: "POST",
                    body: JSON.stringify({
                        UserIds: [userId, selectedUser.id]
                    })
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

            const data = await response.json() as User[];

            setUserId(data.find(user => user.CommonName === sessionStorage.getItem("name"))!.id);

            setUsers(data);

            console.log("users", users);

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
        <div className="flex flex-col h-screen bg-gray-200">
            <div className="p-4 bg-white shadow-md flex justify-start">
                <Autocomplete placeholder="Search users" options={users} setSelected={setSelectedUser} />
                <Autocomplete placeholder="Search groups" options={chats} setSelected={setSelectedGroup} />
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
                    <div className="border border-gray-300 p-4 rounded mb-4">Hello, world!</div>
                    <div className="border border-gray-300 p-4 rounded mb-4">How are you?</div>
                </div>
            </div>
        </div>

    );
}

export default Chat;