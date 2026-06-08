export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

// Reutilizando o padrão Pageable do Spring/Java (comum em chamadas paginadas)
export interface PageableResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}