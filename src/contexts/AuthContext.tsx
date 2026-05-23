'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { api } from '@/services/api';
import { AuthContextData, SignInData, User } from '@/types/Auth';

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const isAuthenticated = !!user;

    useEffect(() => {
        const token = Cookies.get('sep.token');

        if (token) {
            const decoded = jwtDecode<{ sub: string }>(token);
            setUser({ id: decoded.sub });
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
    }, []);

    async function signIn({ email, password }: SignInData) {
        const response = await api.post('/auth/login', { email, password });
        const { token } = response.data;

        Cookies.set('sep.token', token, { expires: 1 });
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const decoded = jwtDecode<{ sub: string }>(token);
        setUser({ id: decoded.sub });

        router.push('/dashboard');
    }

    function signOut() {
        Cookies.remove('sep.token');
        setUser(null);
        delete api.defaults.headers.common.Authorization;
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);