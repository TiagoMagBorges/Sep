"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, GraduationCap, BookOpen, CreditCard, Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

import { ClassGroup, ClassGroupRequest } from "@/types/ClassGroup";
import { Student, PageableResponse } from "@/types/Student";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ClassGroupDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [selectedNewStudentId, setSelectedNewStudentId] = useState("");
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);

    const [isSavingName, setIsSavingName] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchClassGroup = async () => {
        try {
            const response = await api.get<ClassGroup>(`/class-groups/${id}`);
            setClassGroup(response.data);
            setNewName(response.data.name);
        } catch (error) {
            toast.error("Turma não encontrada.");
            router.push("/class-groups");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const response = await api.get<PageableResponse<Student>>("/students?size=100");
            const filtered = response.data.content.filter(
              s => !classGroup?.students.some(groupStudent => groupStudent.id === s.id)
            );
            setAvailableStudents(filtered);
        } catch (error) {
            console.error("Erro ao buscar alunos disponíveis", error);
        }
    };

    useEffect(() => {
        if (id) fetchClassGroup();
    }, [id]);

    useEffect(() => {
        if (isAddStudentModalOpen && classGroup) {
            fetchAvailableStudents();
        }
    }, [isAddStudentModalOpen, classGroup]);

    const handleUpdateName = async () => {
        if (!newName.trim() || !classGroup) return;

        setIsSavingName(true);
        try {
            const currentStudentIds = classGroup.students.map(s => s.id);
            const payload: ClassGroupRequest = {
                name: newName,
                studentIds: currentStudentIds
            };

            await api.put(`/class-groups/${id}`, payload);
            setClassGroup({ ...classGroup, name: newName });
            setIsEditingName(false);
            toast.success("Nome da turma atualizado!");
        } catch (error) {
            toast.error("Erro ao atualizar o nome.");
        } finally {
            setIsSavingName(false);
        }
    };

    const handleRemoveStudent = async () => {
        if (!studentToRemove || !classGroup) return;

        setIsActionLoading(true);
        try {
            const updatedStudentIds = classGroup.students
              .filter(s => s.id !== studentToRemove.id)
              .map(s => s.id);

            const payload: ClassGroupRequest = {
                name: classGroup.name,
                studentIds: updatedStudentIds
            };

            await api.put(`/class-groups/${id}`, payload);
            await fetchClassGroup();
            setStudentToRemove(null);
            toast.success("Aluno removido da turma.");
        } catch (error) {
            toast.error("Erro ao remover o aluno.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAddStudent = async () => {
        if (!selectedNewStudentId || !classGroup) return;

        setIsActionLoading(true);
        try {
            const updatedStudentIds = [...classGroup.students.map(s => s.id), selectedNewStudentId];

            const payload: ClassGroupRequest = {
                name: classGroup.name,
                studentIds: updatedStudentIds
            };

            await api.put(`/class-groups/${id}`, payload);
            await fetchClassGroup();
            setIsAddStudentModalOpen(false);
            setSelectedNewStudentId("");
            toast.success("Aluno adicionado à turma.");
        } catch (error) {
            toast.error("Erro ao adicionar aluno.");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
          <div className="space-y-6 max-w-5xl mx-auto">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
              </div>
          </div>
        );
    }

    if (!classGroup) return null;

    return (
      <div className="space-y-8 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                  <Button variant="outline" size="icon" onClick={() => router.push("/class-groups")} className="shrink-0">
                      <ArrowLeft className="size-4" />
                  </Button>
                  <div className="flex-1">
                      {isEditingName ? (
                        <div className="flex items-center gap-2 max-w-md">
                            <Input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="text-xl font-bold h-10"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                            />
                            <Button size="sm" onClick={handleUpdateName} disabled={isSavingName}>
                                {isSavingName ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setNewName(classGroup.name); }}>
                                Cancelar
                            </Button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{classGroup.name}</h1>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                              onClick={() => setIsEditingName(true)}
                            >
                                <Edit2 className="size-4 text-muted-foreground" />
                            </Button>
                        </div>
                      )}
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Users className="size-4" />
                          {classGroup.students.length} {classGroup.students.length === 1 ? "aluno" : "alunos"}
                      </p>
                  </div>
              </div>

              <Button onClick={() => setIsAddStudentModalOpen(true)} className="shrink-0 gap-2">
                  <Plus className="size-4" /> Adicionar Aluno
              </Button>
          </div>

          <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                  <GraduationCap className="size-5" />
                  Alunos da Turma
              </h2>

              {classGroup.students.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <Users className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Nenhum aluno vinculado a esta turma.</p>
                        <Button variant="link" onClick={() => setIsAddStudentModalOpen(true)}>
                            Adicionar o primeiro aluno
                        </Button>
                    </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classGroup.students.map((student) => (
                      <Card key={student.id} className="group shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-bold pr-8">
                                  <span className="block truncate">{student.name}</span>
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setStudentToRemove(student)}
                              >
                                  <Trash2 className="size-4" />
                              </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <BookOpen className="size-4" />
                                            Disciplina
                                        </span>
                                  <span className="font-medium truncate max-w-[120px]">{student.subject}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <CreditCard className="size-4" />
                                            Pagamento
                                        </span>
                                  <Badge variant="outline" className="bg-primary/5">
                                      {student.billingType === "MONTHLY" ? "Mensalidade" : "Pacote"}
                                  </Badge>
                              </div>
                          </CardContent>
                      </Card>
                    ))}
                </div>
              )}
          </div>

          <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Adicionar Aluno</DialogTitle>
                      <DialogDescription>Selecione um aluno para incluir nesta turma.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                      {availableStudents.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Todos os alunos já estão nesta turma ou não há alunos cadastrados.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {availableStudents.map(student => (
                              <div
                                key={student.id}
                                onClick={() => setSelectedNewStudentId(student.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedNewStudentId === student.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                              >
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.subject}</p>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                  <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddStudent} disabled={!selectedNewStudentId || isActionLoading}>
                          {isActionLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                          Adicionar
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

          <Dialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle className="text-destructive">Remover Aluno</DialogTitle>
                      <DialogDescription>
                          Tem certeza que deseja remover <strong>{studentToRemove?.name}</strong> da turma {classGroup.name}?
                          <br/><br/>
                          O aluno continuará existindo no sistema, mas perderá o vínculo com esta turma.
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setStudentToRemove(null)}>Cancelar</Button>
                      <Button variant="destructive" onClick={handleRemoveStudent} disabled={isActionLoading}>
                          {isActionLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                          Remover
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>
    );
}