import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Keys from "./pages/Keys";
import ThemeProvider from "./providers/ThemeProvider";

function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path="/" element={<SignIn />} />
						<Route path="/signin" element={<SignIn />} />
						<Route path="/chat" element={<Chat />} />
						<Route path="/keys" element={<Keys />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
