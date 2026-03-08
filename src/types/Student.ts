export enum BillingType {
    MENSALIDADE = 'MENSALIDADE',
    PACOTE_CREDITOS = 'PACOTE_CREDITOS'
}

export interface Student {
    id: string;
    nome: string;
    materia: string;
    ativo: boolean;
    tipoCobranca: BillingType;
    saldoCreditos: number;
}

export interface StudentRequest {
    nome: string;
    materia: string;
    ativo: boolean;
    tipoCobranca: BillingType;
    saldoCreditos: number;
}

export interface StudentMetricas {
    ativos: number;
    creditosBaixos: number;
    emDia: number;
}

export interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}