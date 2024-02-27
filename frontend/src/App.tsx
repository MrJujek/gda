import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Keys from "./pages/Keys";
import ThemeProvider from "./providers/ThemeProvider";
import AccessProvider from "./providers/AccessProvider";

function App() {
	return (
		<ThemeProvider>
			<AccessProvider>
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
			</AccessProvider>
		</ThemeProvider>
	);
}

export default App;
