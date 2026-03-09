import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Student, StudentRequest, BillingType } from "@/types/Student";

interface NewStudentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: StudentRequest) => Promise<void>;
    initialData?: Student | null;
    isSaving: boolean;
}

export function NewStudentModal({ open, onClose, onSave, initialData, isSaving }: NewStudentModalProps) {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [billingType, setBillingType] = useState<BillingType>(BillingType.MONTHLY);
    const [creditBalance, setCreditBalance] = useState("");
    const [active, setActive] = useState(true);

    // Sincroniza os dados caso seja uma edição
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setSubject(initialData.subject);
                setBillingType(initialData.billingType);
                setCreditBalance(initialData.creditBalance.toString());
                setActive(initialData.active);
            } else {
                resetForm();
            }
        }
    }, [open, initialData]);

    const resetForm = () => {
        setName("");
        setSubject("");
        setBillingType(BillingType.MONTHLY);
        setCreditBalance("");
        setActive(true);
    };

    const handleSave = async () => {
        if (!name || !subject) return;

        const payload: StudentRequest = {
            name,
            subject,
            active,
            billingType,
            creditBalance: billingType === BillingType.CREDIT_PACKAGE ? Number(creditBalance) : 0
        };

        await onSave(initialData?.id || null, payload);
        onClose();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Atualize os dados do aluno no sistema" : "Cadastre um novo aluno no sistema"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informações Acadêmicas</h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Aluno *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: João Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Matéria *</Label>
                            <Input
                                id="subject"
                                placeholder="Ex: Matemática, Inglês..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Faturamento e Créditos</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="billingType">Modelo de Cobrança *</Label>
                                <Select value={billingType} onValueChange={(v) => setBillingType(v as BillingType)}>
                                    <SelectTrigger id="billingType">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={BillingType.MONTHLY}>Mensalidade Fixa</SelectItem>
                                        <SelectItem value={BillingType.CREDIT_PACKAGE}>Pacote de Créditos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {billingType === BillingType.CREDIT_PACKAGE && (
                                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                                    <Label htmlFor="credits">Saldo de Créditos</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        placeholder="Ex: 12"
                                        value={creditBalance}
                                        onChange={(e) => setCreditBalance(e.target.value)}
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500">Quantidade de aulas pré-pagas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 bg-muted/30 p-3 rounded-lg border">
                        <Checkbox id="active" checked={active} onCheckedChange={(checked) => setActive(checked === true)} />
                        <Label htmlFor="active" className="font-medium cursor-pointer">
                            Aluno Ativo no Sistema
                        </Label>
                    </div>

                    {/* Preview Resumo */}
                    {name && subject && (
                        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-2">Resumo:</p>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><span className="font-medium">Aluno:</span> {name}</p>
                                <p><span className="font-medium">Matéria:</span> {subject}</p>
                                <p><span className="font-medium">Cobrança:</span> {billingType === BillingType.MONTHLY ? 'Mensalidade' : 'Pacote'}</p>
                                {billingType === BillingType.CREDIT_PACKAGE && (
                                    <p><span className="font-medium">Créditos:</span> {creditBalance || 0} aula(s)</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name || !subject || isSaving}
                        className="bg-[#0F4C81] hover:bg-[#0F4C81]/90"
                    >
                        {isSaving ? "Salvando..." : (initialData ? "Salvar Alterações" : "Cadastrar Aluno")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}