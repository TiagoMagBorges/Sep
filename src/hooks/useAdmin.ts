import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { AdminUser, PageableResponse } from "@/types/Admin";
import { toast } from "sonner";

export function useAdmin() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log("OI")
            const response = await api.get<PageableResponse<AdminUser>>(`/admin/users?page=${page}&size=${pageSize}`);
            console.log(response.data?.content || []);
            setUsers(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 0);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setUsers([]);
            toast.error("Não foi possível carregar a lista de usuários.");
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const deleteUser = async (id: string) => {
        setIsDeleting(true);
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("Usuário removido com sucesso!");
            await fetchUsers();
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            toast.error("Ocorreu um erro ao tentar remover este usuário.");
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    const nextPage = () => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev));
    const prevPage = () => setPage((prev) => (prev > 0 ? prev - 1 : 0));

    return {
        users: users || [],
        isLoading,
        isDeleting,
        page,
        totalPages,
        nextPage,
        prevPage,
        deleteUser
    };
}