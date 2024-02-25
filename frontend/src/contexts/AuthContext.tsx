import React, { ReactNode, useContext, useEffect, useState } from "react";

interface User {
    status: string;
}

interface SignInData {
    logged: boolean;
    url: string;
    message?: string;
}

interface AuthProvider {
    user: User | null;
    signIn: (email: string, password: string) => Promise<SignInData>;
    logout: () => { loggedOut?: boolean };
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = React.createContext({} as AuthProvider);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const value = {
        user,
        signIn,
        logout,
        setUser,
    };

    async function authenticate() {
        const response = await fetch("/api/session", {
            method: "GET",
        });

        if (response.ok) {
            return { status: "Logged in" } as User;
        }

        logout();
        return { status: "Authentication failed" } as User;
    }

    async function signIn(name: string, pass: string) {
        const response = await fetch("/api/session", {
            method: "POST",
            body: JSON.stringify({
                user: name,
                pass: pass
            })
        });

        if (response.ok) {
            setUser(await authenticate());

            return { logged: true, url: "/chat" } as SignInData;
        }
        return { logged: false, message: "Authentication failed" } as SignInData;
    }

    function logout() {
        setUser(null);

        return { loggedOut: true };
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
