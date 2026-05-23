import { Student } from "./Student";
import { PageableResponse } from "./Student";

export interface ClassGroup {
    id: string;
    name: string;
    students: Student[];
}

export interface ClassGroupRequest {
    name: string;
    studentIds: string[];
}

export type ClassGroupPageableResponse = PageableResponse<ClassGroup>;