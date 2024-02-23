import { useEffect } from "react";
import Logout from "../components/Logout";

function Chat() {
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch('https://api.example.com/data');
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             const result = await response.json();
    //             console.log('Data:', result);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

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