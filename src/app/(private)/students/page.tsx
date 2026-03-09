"use client";

import { useState, SyntheticEvent } from "react";
import { Search, Plus, AlertCircle, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Student, StudentRequest, BillingType } from "@/types/Student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useStudents } from "@/hooks/useStudents";

export default function StudentsPage() {
    const { students, metrics, isLoading, isSaving, search, setSearch, saveStudent, deleteStudent } = useStudents();

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<StudentRequest>({
        name: "",
        subject: "",
        active: true,
        billingType: BillingType.MONTHLY,
        creditBalance: 0,
    });

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    const openSheet = (student?: Student) => {
        if (student) {
            setEditingId(student.id);
            setFormData({
                name: student.name,
                subject: student.subject,
                active: student.active,
                billingType: student.billingType,
                creditBalance: student.creditBalance,
            });
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                subject: "",
                active: true,
                billingType: BillingType.MONTHLY,
                creditBalance: 0,
            });
        }
        setIsSheetOpen(true);
    };

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        const payload: StudentRequest = {
            ...formData,
            creditBalance: formData.billingType === BillingType.CREDIT_PACKAGE ? Number(formData.creditBalance) : 0
        };

        await saveStudent(editingId, payload);
        setIsSheetOpen(false);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus alunos e créditos</p>
                </div>
                <Button onClick={() => openSheet()} className="shrink-0 gap-2">
                    <Plus className="size-4" /> Novo Aluno
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-primary">{metrics?.active || 0}</span>
                        <span className="text-sm text-muted-foreground mt-1">Ativos</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-orange-500">{metrics?.lowCredits || 0}</span>
                        <span className="text-sm text-muted-foreground mt-1">Créditos Baixos</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-green-600">{metrics?.upToDate || 0}</span>
                        <span className="text-sm text-muted-foreground mt-1">Em Dia</span>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou matéria..."
                    className="pl-10 py-6 bg-muted/50 border-transparent focus-visible:bg-background text-base rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {metrics && metrics.lowCredits > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl">
                    <AlertCircle className="size-5 text-orange-500 shrink-0" />
                    <p className="text-sm font-medium">
                        <span className="font-bold">{metrics.lowCredits} alunos</span> com créditos baixos precisam de atenção.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando alunos...</div>
                ) : students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado.</div>
                ) : (
                    students.map((student) => {
                        const isPackage = student.billingType === BillingType.CREDIT_PACKAGE;
                        const hasLowCredits = isPackage && student.creditBalance <= 3;

                        return (
                            <div key={student.id} className="group flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground shrink-0">
                                        {getInitials(student.name)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-base">{student.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {student.subject} • {student.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        {isPackage ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-2 rounded-full ${hasLowCredits ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <span className={`font-semibold ${hasLowCredits ? 'text-red-600' : 'text-green-700'}`}>
                                                        {student.creditBalance} créditos
                                                    </span>
                                                </div>
                                                {hasLowCredits && (
                                                    <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                                        <AlertCircle className="size-3" /> Renovar agora
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md text-sm">
                                                Mensalidade
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openSheet(student)}>
                                            <Edit2 className="size-4 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => deleteStudent(student.id)}>
                                            <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                                        </Button>
                                    </div>
                                    <ChevronRight className="size-5 text-muted-foreground opacity-50 ml-2" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Matéria</Label>
                            <Input
                                id="subject"
                                placeholder="Ex: Matemática, Inglês..."
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="billingType">Modelo de Cobrança</Label>
                            <select
                                id="billingType"
                                className="flex h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-base text-foreground shadow-sm transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                value={formData.billingType}
                                onChange={(e) => setFormData({ ...formData, billingType: e.target.value as BillingType })}
                            >
                                <option value={BillingType.MONTHLY}>Mensalidade Fixa</option>
                                <option value={BillingType.CREDIT_PACKAGE}>Pacote de Créditos</option>
                            </select>
                        </div>

                        {formData.billingType === BillingType.CREDIT_PACKAGE && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="creditBalance">Saldo Inicial de Créditos</Label>
                                <Input
                                    id="creditBalance"
                                    type="number"
                                    min="0"
                                    value={formData.creditBalance}
                                    onChange={(e) => setFormData({ ...formData, creditBalance: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData({ ...formData, active: checked === true })}
                            />
                            <Label htmlFor="active" className="font-normal cursor-pointer">
                                Aluno Ativo no Sistema
                            </Label>
                        </div>

                        <SheetFooter className="mt-auto">
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Salvando..." : "Salvar"}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}