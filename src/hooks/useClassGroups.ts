import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { ClassGroup, ClassGroupRequest, ClassGroupPageableResponse } from "@/types/ClassGroup";
import { Student } from "@/types/Student";

export function useClassGroups() {
    const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [groupsRes, studentsRes] = await Promise.all([
                api.get<ClassGroupPageableResponse>("/class-groups?size=100"),
                api.get<any>("/students?size=100")
            ]);
            setClassGroups(groupsRes.data.content);
            setAvailableStudents(studentsRes.data.content);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredGroups = classGroups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    const saveClassGroup = async (id: string | null, payload: ClassGroupRequest) => {
        setIsSaving(true);
        try {
            if (id) {
                await api.put(`/class-groups/${id}`, payload);
            } else {
                await api.post("/class-groups", payload);
            }
            await fetchData();
        } finally {
            setIsSaving(false);
        }
    };

    const deleteClassGroup = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover esta turma? Os alunos não serão excluídos.")) return;
        try {
            await api.delete(`/class-groups/${id}`);
            await fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        classGroups: filteredGroups,
        availableStudents,
        isLoading,
        isSaving,
        search,
        setSearch,
        saveClassGroup,
        deleteClassGroup
    };
}