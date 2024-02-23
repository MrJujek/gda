import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    const logout = async () => {
        fetch('/api/session', {
            method: 'DELETE',
        });

        navigate("/")
    };
    return (
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={logout}>
            <h1>Wyloguj</h1>
        </button>
    );
}

export default Logout;