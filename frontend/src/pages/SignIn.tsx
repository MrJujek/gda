import { useState, FormEvent } from 'react';

function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        // Handle sign-in logic here
        console.log(`Email: ${email}, Password ${password}`);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-6 bg-white rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-5 text-gray-800">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2">
                        Email:
                        <input type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <label className="block mb-4">
                        Password:
                        <input type="password" value={password} onChange={e => setPassword(e.currentTarget.value)} required
                            className="mt-1 p-2 w-full border border-gray-300 rounded" />
                    </label>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Sign In</button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;