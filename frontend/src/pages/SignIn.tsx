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
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={e => setPassword(e.currentTarget.value)} required />
                </label>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}

export default SignIn;