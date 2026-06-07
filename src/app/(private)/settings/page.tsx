"use client";

import { useState } from "react";
import { AlertCircle, ShieldAlert, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const { signOut } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hasConfirmedRetention, setHasConfirmedRetention] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleDeleteAccount() {
        if (!hasConfirmedRetention) return;

        try {
            setIsDeletingAccount(true);
            setErrorMessage("");
            const response = await api.delete("/auth/me");

            if (response.status === 204 || response.status === 200) {
                signOut();
                return;
            }

            setErrorMessage("Não foi possível confirmar a exclusão da conta.");
        } catch (error) {
            console.error(error);
            setErrorMessage("Não foi possível excluir a conta. Tente novamente.");
        } finally {
            setIsDeletingAccount(false);
        }
    }

    function closeDeleteModal() {
        if (isDeletingAccount) return;

        setIsDeleteModalOpen(false);
        setHasConfirmedRetention(false);
        setErrorMessage("");
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="mt-1 text-muted-foreground">Gerencie sua conta e preferências de acesso.</p>
            </div>

            <Card className="shadow-sm">
                <CardContent className="space-y-6 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Conta do professor</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Solicite o arquivamento da sua conta e dos dados vinculados.
                            </p>
                        </div>
                        <Button variant="destructive" className="gap-2" onClick={() => setIsDeleteModalOpen(true)}>
                            <Trash2 className="size-4" />
                            Excluir conta
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                        className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
                    >
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div className="space-y-3">
                                <h2 id="delete-account-title" className="text-lg font-semibold">
                                    Confirmar exclusão da conta
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Sua conta será desativada e seus dados serão movidos para arquivo morto. Eles ficarão retidos por 2 anos antes da exclusão física definitiva.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Durante esse período, o acesso ao sistema será encerrado e os dados permanecerão preservados apenas para cumprir a política de retenção.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                            <div className="flex gap-2">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                <p>Ao confirmar, sua sessão será encerrada imediatamente e os dados locais do navegador serão limpos.</p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-start gap-3">
                            <Checkbox
                                id="retention-confirmation"
                                checked={hasConfirmedRetention}
                                onCheckedChange={(checked) => setHasConfirmedRetention(checked === true)}
                            />
                            <Label htmlFor="retention-confirmation" className="text-sm font-normal leading-5">
                                Compreendo que meus dados ficarão retidos em arquivo morto por 2 anos antes da exclusão física.
                            </Label>
                        </div>

                        {errorMessage && (
                            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                {errorMessage}
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeletingAccount}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={!hasConfirmedRetention || isDeletingAccount}
                            >
                                {isDeletingAccount ? "Excluindo..." : "Confirmar exclusão"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
