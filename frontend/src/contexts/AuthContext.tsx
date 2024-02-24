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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUserFromLocalStorage() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setUser(await authenticate());
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        }
        loadUserFromLocalStorage();
    }, []);

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

        console.log("response", response);


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
        console.log("response", response);

        if (response.ok) {
            console.log("response.ok", response.ok);

            setUser(await authenticate());

            return { logged: true, url: "/chat" } as SignInData;
        }
        return { logged: false, message: "Authentication failed" } as SignInData;
    }

    function logout() {
        console.log("logout");

        setUser(null);

        return { loggedOut: true };
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
