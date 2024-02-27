import React, { ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface SignInData {
	logged: boolean;
	url: string;
	message?: string;
}

interface AuthProvider {
	loggedIn: () => Promise<number | null>;
	signIn: (email: string, password: string) => Promise<SignInData>;
	logout: () => Promise<void>;
}

export const AuthContext = React.createContext({} as AuthProvider);

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const value = {
		loggedIn,
		signIn,
		logout,
	};

	const navigate = useNavigate();

	async function loggedIn(): Promise<number | null> {
		const response = await fetch("/api/session", {
			method: "GET",
		});
		if (response.ok) {
			return Number(await response.text());
		} else {
			return null;
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
