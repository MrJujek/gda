import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SignIn() {
    const [name, setName] = useState<string>('');
    const [pass, setPass] = useState<string>('');
    const [error, setError] = useState<string>('');

    const { user, signIn } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/chat");
        }
    }, [user, navigate]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setName(e.currentTarget.value);
        setError('');
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setPass(e.currentTarget.value);
        setError('');
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const info = await signIn(name, pass);

        console.log("info", info);


        if (info.logged === false) {
            setError("Błędne dane");
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
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2">
                        Nazwa użytkownika:
                        <input type="text" value={name} onChange={handleNameChange} required
                            className={`mt-1 p-2 w-full border border-gray-300 rounded ${error && 'border-red-500'}`} />
                    </label>
                    <label className="block mb-4">
                        Hasło:
                        <input type="password" value={pass} onChange={handlePassChange} required
                            className={`mt-1 p-2 w-full border border-gray-300 rounded ${error && 'border-red-500'}`} />
                    </label>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;