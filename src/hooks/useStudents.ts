import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Student, StudentMetrics, PageableResponse, StudentRequest } from "@/types/Student";

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [studentsRes, metricsRes] = await Promise.all([
                api.get<PageableResponse<Student>>("/students?size=100"),
                api.get<StudentMetrics>("/students/metrics")
            ]);
            setStudents(studentsRes.data.content);
            setMetrics(metricsRes.data);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.subject.toLowerCase().includes(search.toLowerCase())
    );

    const saveStudent = async (id: string | null, payload: StudentRequest) => {
        setIsSaving(true);
        try {
            if (id) {
                await api.put(`/students/${id}`, payload);
            } else {
                await api.post("/students", payload);
            }
            await fetchData();
        } finally {
            setIsSaving(false);
        }
    };

    const deleteStudent = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este aluno?")) return;
        try {
            await api.delete(`/students/${id}`);
            await fetchData();
        } catch (error) {
            console.error("Erro ao deletar aluno:", error);
        }
    };

    return {
        students: filteredStudents,
        metrics,
        isLoading,
        isSaving,
        search,
        setSearch,
        saveStudent,
        deleteStudent
    };
}