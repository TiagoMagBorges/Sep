export enum BillingType {
    MONTHLY = 'MONTHLY',
    CREDIT_PACKAGE = 'CREDIT_PACKAGE'
}

export interface Student {
    id: string;
    name: string;
    subject: string;
    active: boolean;
    billingType: BillingType;
    creditBalance: number;
}

export interface StudentRequest {
    name: string;
    subject: string;
    active: boolean;
    billingType: BillingType;
    creditBalance: number;
}

export interface StudentMetrics {
    active: number;
    lowCredits: number;
    upToDate: number;
}

export interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}