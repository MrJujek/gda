import React, { ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface User {
	status: string;
}

interface SignInData {
	logged: boolean;
	url: string;
	message?: string;
}

interface AuthProvider {
	getUser: () => Promise<User>;
	signIn: (email: string, password: string) => Promise<SignInData>;
	logout: () => Promise<void>;
}

export const AuthContext = React.createContext({} as AuthProvider);

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const value = {
		getUser: authenticate,
		signIn,
		logout,
	};

	const navigate = useNavigate();

	async function authenticate() {
		const response = await fetch("/api/session", {
			method: "GET",
		});

		if (response.ok) {
			return { status: "Logged in" } as User;
		} else {
			logout();
			return { status: "Authentication failed" } as User;
		}
	}

	async function signIn(name: string, pass: string) {
		const response = await fetch("/api/session", {
			method: "POST",
			body: JSON.stringify({
				user: name,
				pass: pass,
			}),
		});

		if (response.ok) {
			return { logged: true, url: response.url || "/chat" } as SignInData;
		}
		return { logged: false, message: "Authentication failed" } as SignInData;
	}

	async function logout() {
		await fetch("/api/session", { method: "DELETE" });
		navigate("/");
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
