import React, { ReactNode, useContext, useEffect, useState } from "react";

interface User {
    name: string;
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

        if (response.ok) {
            const data = await response.json();

            if (data.name) {
                return data.name;
            }
        }

        logout();
        return "Authentication failed";
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
            const data = await response.json() as SignInData;

            setUser(await authenticate());

            return data;
        }
        return { logged: false, message: "Authentication failed" } as SignInData;
    }

    function logout() {
        setUser(null);

        return { loggedOut: true };
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
