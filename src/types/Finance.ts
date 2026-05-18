export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface Finance {
    id: string;
    studentId?: string;
    studentName?: string;
    classGroupId?: string;
    classGroupName?: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    description?: string;
}

export interface FinanceRequest {
    studentId?: string;
    classGroupId?: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    description?: string;
}