import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ClassGroup, ClassGroupRequest } from "@/types/ClassGroup";
import { Student } from "@/types/Student";

interface NewClassGroupModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: ClassGroupRequest) => Promise<void>;
    initialData?: ClassGroup | null;
    availableStudents: Student[];
    isSaving: boolean;
}

export function NewClassGroupModal({ open, onClose, onSave, initialData, availableStudents, isSaving }: NewClassGroupModalProps) {
    const [name, setName] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [searchStudent, setSearchStudent] = useState("");

    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setSelectedStudentIds(initialData.students.map(s => s.id));
            } else {
                resetForm();
            }
        }
    }, [open, initialData]);

    const resetForm = () => {
        setName("");
        setSelectedStudentIds([]);
        setSearchStudent("");
    };

    const handleSave = async () => {
        if (!name) return;

        const payload: ClassGroupRequest = {
            name,
            studentIds: selectedStudentIds
        };

        await onSave(initialData?.id || null, payload);
        onClose();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const filteredStudents = availableStudents.filter(s =>
        s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchStudent.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Atualize os dados e os alunos desta turma." : "Crie uma nova turma e adicione alunos a ela."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Turma *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Turma de Inglês Avançado - Terças"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Alunos da Turma</h3>
                            <span className="text-sm font-medium text-muted-foreground">
                                {selectedStudentIds.length} selecionados
                            </span>
                        </div>

                        <Input
                            placeholder="Buscar alunos para adicionar..."
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            className="h-9"
                        />

                        <div className="max-h-[250px] overflow-y-auto border rounded-md p-2 space-y-1">
                            {filteredStudents.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">Nenhum aluno encontrado.</p>
                            ) : (
                                filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                                        onClick={() => toggleStudent(student.id)}
                                    >
                                        <Checkbox
                                            id={`student-${student.id}`}
                                            checked={selectedStudentIds.includes(student.id)}
                                            onCheckedChange={() => toggleStudent(student.id)}
                                        />
                                        <div className="flex flex-col">
                                            <Label
                                                htmlFor={`student-${student.id}`}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {student.name}
                                            </Label>
                                            <span className="text-xs text-muted-foreground">
                                                {student.subject}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {name && (
                        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 mt-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">Resumo:</p>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><span className="font-medium">Turma:</span> {name}</p>
                                <p><span className="font-medium">Total de Alunos:</span> {selectedStudentIds.length}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name || isSaving}
                        className="bg-[#0F4C81] hover:bg-[#0F4C81]/90"
                    >
                        {isSaving ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Turma")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}