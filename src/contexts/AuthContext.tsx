'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { api } from '@/services/api';
import { AuthContextData, SignInData, User } from '@/types/Auth';

const AuthContext = createContext({} as AuthContextData);

function getStoredUser(): User | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const token = Cookies.get('sep.token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<{ sub: string }>(token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return { id: decoded.sub };
    } catch {
        Cookies.remove('sep.token');
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => getStoredUser());
    const router = useRouter();

    const isAuthenticated = !!user;

    function clearClientSession() {
        Object.keys(Cookies.get()).forEach((cookieName) => {
            Cookies.remove(cookieName);
            Cookies.remove(cookieName, { path: '/' });
        });

        if (typeof window !== 'undefined') {
            window.localStorage.clear();
            window.sessionStorage.clear();
        }

        delete api.defaults.headers.common.Authorization;
    }

    async function signIn({ email, senha }: SignInData) {
        const response = await api.post('/auth/login', { email, senha });
        const { token } = response.data;

        Cookies.set('sep.token', token, { expires: 1 });
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const decoded = jwtDecode<{ sub: string }>(token);
        setUser({ id: decoded.sub });

        router.push('/dashboard');
    }

    function signOut() {
        clearClientSession();
        setUser(null);
        router.replace('/login');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
