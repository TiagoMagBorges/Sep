import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { User, PageableResponse } from "@/types/Admin";
import { toast } from "sonner";

export function useAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get<PageableResponse<User>>(`/admin/users?page=${page}&size=${pageSize}`);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
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
        users,
        isLoading,
        isDeleting,
        page,
        totalPages,
        nextPage,
        prevPage,
        deleteUser
    };
}
