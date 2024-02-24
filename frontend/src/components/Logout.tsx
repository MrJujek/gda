import { useAuth } from "../contexts/AuthContext";

function Logout() {
    const { logout } = useAuth();

    return (
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={logout}>
            <h1>Wyloguj</h1>
        </button>
    );
}

export default Logout;