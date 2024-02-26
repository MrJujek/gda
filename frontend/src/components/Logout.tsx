import { useAuth } from "../contexts/AuthContext";

function Logout() {
    const { logout } = useAuth();

    return (
        <button 
            className="text-white bg-cornflower-blue border border-red-500 px-4 py-2 rounded-lg hover:bg-dark-cornflower-blue hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
            onClick={logout}
            style={{ backgroundColor: '#6495ed', borderColor: '#ffffff' }} // Inline styles for specific color codes
        >
            <h1>Wyloguj</h1>
        </button>
    );
}

export default Logout;