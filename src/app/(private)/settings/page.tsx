"use client";

import { useEffect, useState } from "react";
import { User, Bell, Lock, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, ProfessorProfile } from "@/hooks/useProfile";
import { api } from "@/services/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const { signOut } = useAuth();
    const { profile, isLoading, updateProfile, deleteAccount } = useProfile();

    const [formData, setFormData] = useState<ProfessorProfile>({
        name: "",
        email: "",
        phone: "",
        emailNotifications: false,
        lowCreditAlerts: false,
        missedClassAlerts: false,
        paymentAlerts: false,
    });

    const [passwords, setPasswords] = useState({ current: "", new: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            const timeoutId = setTimeout(() => {
                setFormData(profile);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        await updateProfile(formData);
        setIsSaving(false);
    };

    const handleChangePassword = async () => {
        if (!passwords.current || passwords.new.length < 6) return;
        try {
            await api.put("/professors/me/password", {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setPasswords({ current: "", new: "" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Esta ação é irreversível. Deseja realmente excluir sua conta?")) return;
        const success = await deleteAccount();
        if (success) signOut();
    };

    if (isLoading) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Configurações</h1>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="size-5 text-muted-foreground" />
                        <CardTitle>Perfil</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="size-5 text-muted-foreground" />
                        <CardTitle>Notificações</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label className="text-base">Notificações por e-mail</Label>
                        </div>
                        <Switch
                            checked={formData.emailNotifications}
                            onCheckedChange={(checked: boolean) => {
                                const newData = { ...formData, emailNotifications: checked };
                                setFormData(newData);
                                updateProfile(newData);
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label className="text-base">Alertas de créditos baixos</Label>
                        </div>
                        <Switch
                            checked={formData.lowCreditAlerts}
                            onCheckedChange={(checked: boolean) => {
                                const newData = { ...formData, lowCreditAlerts: checked };
                                setFormData(newData);
                                updateProfile(newData);
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label className="text-base">Faltas e cancelamentos</Label>
                        </div>
                        <Switch
                            checked={formData.missedClassAlerts}
                            onCheckedChange={(checked: boolean) => {
                                const newData = { ...formData, missedClassAlerts: checked };
                                setFormData(newData);
                                updateProfile(newData);
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label className="text-base">Pagamentos</Label>
                        </div>
                        <Switch
                            checked={formData.paymentAlerts}
                            onCheckedChange={(checked: boolean) => {
                                const newData = { ...formData, paymentAlerts: checked };
                                setFormData(newData);
                                updateProfile(newData);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="size-5 text-muted-foreground" />
                        <CardTitle>Segurança</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Senha atual</Label>
                            <Input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nova senha</Label>
                            <Input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleChangePassword} disabled={!passwords.current || passwords.new.length < 6}>
                        Alterar senha
                    </Button>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="size-5 text-muted-foreground" />
                        <CardTitle>Plano do Sistema SEP</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-medium">Plano Atual</p>
                        </div>
                        <Button variant="outline" disabled>Gerenciar plano</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <LogOut className="size-5 text-red-600" />
                        <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="w-full sm:w-auto">Exportar dados (CSV)</Button>
                            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto">Encerrar conta</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}