import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SignIn() {
    const [name, setName] = useState<string>('');
    const [pass, setPass] = useState<string>('');

    const { user, signIn } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const info = await signIn(name, pass);

        if (info.logged === false) {
            console.error("Authentication failed");
            return;
        } else {
            sessionStorage.setItem("pass", pass)

            if (info.url.includes("chat")) {
                navigate("/chat");
            } else {
                navigate("/keys");
            }
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-6 bg-white rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-5 text-gray-800">Logowanie</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2">
                        Nazwa użytkownika:
                        <input type="text" value={name} onChange={(e) => setName(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <label className="block mb-4">
                        Hasło:
                        <input type="password" value={pass} onChange={(e) => setPass(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;