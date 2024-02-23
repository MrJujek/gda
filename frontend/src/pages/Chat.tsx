import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import Logout from "../components/Logout";

function Chat() {
    const navigate = useNavigate();

    const { user } = useAuth();

    // useEffect(() => {
    //     if (!user) {
    //         navigate("/");
    //     }
    // }, [user, navigate]);

    return (
        <div className="flex flex-col h-screen bg-gray-200">
            <div className="p-4 bg-white shadow-md flex justify-end">
                <Logout></Logout>
            </div>

            <div className="flex h-screen bg-gray-200">
                <div className="w-64 bg-white p-4 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Users</h2>
                    <div className="mb-8">User 1</div>
                    <div className="mb-8">User 2</div>

                    <h2 className="text-2xl font-bold mb-4">Groups</h2>
                    <div className="mb-8">Group 1</div>
                    <div className="mb-8">Group 2</div>
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