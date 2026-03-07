export interface User {
    id: string;
}

export interface SignInData {
    email: string;
    senha: string;
}

export interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInData) => Promise<void>;
    signOut: () => void;
}