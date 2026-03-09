"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, AlertCircle, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Student, BillingType } from "@/types/Student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useStudents } from "@/hooks/useStudents";
import { NewStudentModal } from "@/components/new-student-modal";

export default function StudentsPage() {
    const { students, metrics, isLoading, isSaving, search, setSearch, saveStudent, deleteStudent } = useStudents();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    const openModal = (student?: Student) => {
        setEditingStudent(student || null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus alunos e créditos</p>
                </div>
                <Button onClick={() => openModal()} className="shrink-0 gap-2">
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
                        const hasLowCredits = isPackage && student.creditBalance <= 3 && student.creditBalance > 0;
                        const isNegativeOrZero = isPackage && student.creditBalance <= 0;

                        return (
                            <Link key={student.id} href={`/students/${student.id}`} className="block">
                                <div className="group flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
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
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            {isPackage ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-2 rounded-full ${isNegativeOrZero ? 'bg-red-600 animate-pulse' : hasLowCredits ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                        <span className={`font-semibold ${isNegativeOrZero ? 'text-red-600' : hasLowCredits ? 'text-orange-600' : 'text-green-700'}`}>
                                                            {student.creditBalance} créditos
                                                        </span>
                                                    </div>
                                                    {(hasLowCredits || isNegativeOrZero) && (
                                                        <span className={`text-xs flex items-center gap-1 mt-0.5 ${isNegativeOrZero ? 'text-red-600 font-bold' : 'text-orange-500'}`}>
                                                            <AlertCircle className="size-3" /> {isNegativeOrZero ? 'Renovar agora' : 'Renovar em breve'}
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openModal(student); }}
                                            >
                                                <Edit2 className="size-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteStudent(student.id); }}
                                            >
                                                <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                                            </Button>
                                        </div>
                                        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <NewStudentModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveStudent}
                initialData={editingStudent}
                isSaving={isSaving}
            />
        </div>
    );
}