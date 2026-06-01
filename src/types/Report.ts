export interface LessonNote {
    date: string;
    note: string;
}

export interface ProfessorAnalytics {
    studentId: string;
    studentName: string;
    totalLessons: number;
    attendedLessons: number;
    missedLessons: number;
    attendanceRate: number;
    privateNotes: LessonNote[];
}

export interface ClassGroupAnalytics {
    classGroupId: string;
    classGroupName: string;
    totalLessons: number;
    attendanceRate: number;
    privateNotes: LessonNote[];
}

export interface FinanceAnalytics {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
}

export type ReportType = "student" | "class" | "finance";

export type AnalyticsResponse = ProfessorAnalytics | ClassGroupAnalytics | FinanceAnalytics;