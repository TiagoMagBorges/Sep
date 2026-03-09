"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Student, PageableResponse } from "@/types/Student";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";

interface AddPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export function AddPaymentModal({ open, onOpenChange, onSave }: AddPaymentModalProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [studentId, setStudentId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("PAID");
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setIsLoadingStudents(true);
            api.get<PageableResponse<Student>>("/students?size=100")
                .then(res => setStudents(res.data.content))
                .finally(() => setIsLoadingStudents(false));
        }
    }, [open]);

    const handleSave = async () => {
        if (!studentId || !amount || !date) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        try {
            setIsSaving(true);
            await api.post("/finances", {
                studentId,
                amount: parseFloat(amount),
                dueDate: format(date, "yyyy-MM-dd"),
                status: status
            });

            toast.success("Pagamento registrado com sucesso!");
            onSave?.();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            toast.error("Erro ao registrar pagamento");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setStudentId("");
        setAmount("");
        setDate(new Date());
        setDescription("");
        setStatus("PAID");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>Adicione um novo lançamento financeiro para um aluno.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Aluno</Label>
                        <Select value={studentId} onValueChange={setStudentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingStudents ? "Carregando..." : "Selecione o aluno"} />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy") : <span>Selecione</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PAID">Pago</SelectItem>
                                <SelectItem value="PENDING">Pendente</SelectItem>
                                <SelectItem value="OVERDUE">Atrasado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Registro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}