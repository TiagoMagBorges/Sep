export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface PageableResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
