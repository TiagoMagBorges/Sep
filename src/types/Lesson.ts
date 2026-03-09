export enum LessonStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export interface Lesson {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    dateTime: string;
    endTime: string;
    status: LessonStatus;
}

export interface LessonRequest {
    studentId: string;
    dateTime: string;
    endTime: string;
    status: LessonStatus;
}