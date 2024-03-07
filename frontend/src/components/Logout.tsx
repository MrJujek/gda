import { useAuth } from "../contexts/AuthContext";

function Logout() {
	const { logout } = useAuth();

	return (
		<button
			className="text-lg duration-100 transition text-white dark:text-gray-800 bg-blue-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition duration-300 ease-in-out"
			onClick={logout}
		>
			<h1>Wyloguj</h1>
		</button>
	);
}

export default Logout;