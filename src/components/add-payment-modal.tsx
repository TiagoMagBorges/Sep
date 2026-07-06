"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, User, Users } from "lucide-react";
import { api } from "@/services/api";
import { Student, PageableResponse } from "@/types/Student";
import { ClassGroup, ClassGroupPageableResponse } from "@/types/ClassGroup";
import { FinanceRequest } from "@/types/Finance";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";

interface AddPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (payload: FinanceRequest) => Promise<boolean>;
}

export function AddPaymentModal({ open, onOpenChange, onSave }: AddPaymentModalProps) {
    const [mode, setMode] = useState<"student" | "class">("student");
    const [students, setStudents] = useState<Student[]>([]);
    const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);

    const [studentId, setStudentId] = useState("");
    const [classGroupId, setClassGroupId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setIsLoadingData(true);
            Promise.all([
                api.get<PageableResponse<Student>>("/students?size=100"),
                api.get<ClassGroupPageableResponse>("/class-groups?size=100")
            ]).then(([studentsRes, classGroupsRes]) => {
                setStudents(studentsRes.data.content);
                setClassGroups(classGroupsRes.data.content);
            }).finally(() => setIsLoadingData(false));
        }
    }, [open]);

    const handleSave = async () => {
        if ((mode === "student" && !studentId) || (mode === "class" && !classGroupId) || !amount || !date) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }

        setIsSaving(true);

        const payload: FinanceRequest = {
            amount: parseFloat(amount),
            dueDate: format(date, "yyyy-MM-dd"),
            status: status,
            description: description
        };

        if (mode === "student") payload.studentId = studentId;
        if (mode === "class") payload.classGroupId = classGroupId;

        try {
            if (onSave) {
                const success = await onSave(payload);
                if (success) {
                    toast.success("Pagamento registrado com sucesso!");
                    onOpenChange(false);
                    resetForm();
                }
            } else {
                await api.post("/finances", payload);
                toast.success("Pagamento registrado com sucesso!");
                onOpenChange(false);
                resetForm();
            }
        } catch (error) {
            toast.error("Erro ao registrar pagamento");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setStudentId("");
        setClassGroupId("");
        setAmount("");
        setDate(new Date());
        setDescription("");
        setStatus("PAID");
    };

    const isFormValid = (mode === "student" ? !!studentId : !!classGroupId) && !!amount && !!date;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle>Registrar Pagamento</DialogTitle>
                  <DialogDescription>Adicione um novo lançamento financeiro.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                  <div className="flex p-1 bg-muted rounded-lg w-full">
                      <Button
                        type="button"
                        variant={mode === "student" ? "secondary" : "ghost"}
                        className="w-1/2 gap-2"
                        onClick={() => { setMode("student"); setStudentId(""); setClassGroupId(""); }}
                      >
                          <User className="size-4" /> Aluno
                      </Button>
                      <Button
                        type="button"
                        variant={mode === "class" ? "secondary" : "ghost"}
                        className="w-1/2 gap-2"
                        onClick={() => { setMode("class"); setStudentId(""); setClassGroupId(""); }}
                      >
                          <Users className="size-4" /> Turma
                      </Button>
                  </div>

                  {mode === "student" && (
                    <div className="space-y-2">
                        <Label>Aluno</Label>
                        <Select value={studentId} onValueChange={setStudentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingData ? "Carregando..." : "Selecione o aluno"} />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  )}

                  {mode === "class" && (
                    <div className="space-y-2">
                        <Label>Turma</Label>
                        <Select value={classGroupId} onValueChange={setClassGroupId}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingData ? "Carregando..." : "Selecione a turma"} />
                            </SelectTrigger>
                            <SelectContent>
                                {classGroups.map(g => (
                                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                      <Label>Descrição (Opcional)</Label>
                      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Mensalidade Maio" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
                      </div>
                      <div className="space-y-2">
                          <Label>Vencimento / Data</Label>
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
                      <Select value={status} onValueChange={(v: any) => setStatus(v)}>
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
                  <Button onClick={handleSave} disabled={isSaving || !isFormValid}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Registro
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}