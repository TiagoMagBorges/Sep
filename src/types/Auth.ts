export interface User {
    id: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInData) => Promise<void>;
    signOut: () => void;
}