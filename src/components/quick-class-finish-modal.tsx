import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Info, Clock, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Lesson, LessonStatus } from "@/types/Lesson";

interface QuickClassFinishModalProps {
    classData: Lesson;
    open: boolean;
    onClose: () => void;
    onStatusUpdate: (id: string, newStatus: LessonStatus, publicLog: string, privateNotes: string) => Promise<void>;
}

export function QuickClassFinishModal({ classData, open, onClose, onStatusUpdate }: QuickClassFinishModalProps) {
    const [status, setStatus] = useState<"attended" | "missed">("attended");
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            const timeoutId = setTimeout(() => {
                setPublicNotes(classData.publicLog || "");
                setPrivateNotes(classData.privateNotes || "");
                setStatus(classData.status === LessonStatus.CANCELED ? "missed" : "attended");
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [open, classData]);

    const extractTime = (isoString: string) => new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const handleSave = async () => {
        setIsSaving(true);
        const newStatus = status === "attended" ? LessonStatus.COMPLETED : LessonStatus.CANCELED;
        await onStatusUpdate(classData.id, newStatus, publicNotes, privateNotes);
        setIsSaving(false);
        handleClose();
    };

    const handleClose = () => {
        onClose();
    };

    const isClassGroup = !!classData.classGroupId;
    const targetName = isClassGroup ? classData.classGroupName : classData.studentName;

    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                  <DialogTitle>Finalizar Aula</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2">
                  <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              {isClassGroup ? (
                                <Users className="size-6 text-primary" />
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                        {targetName?.charAt(0)}
                                    </span>
                              )}
                          </div>
                          <div className="flex-1">
                              <p className="font-semibold">{targetName}</p>
                              <p className="text-sm text-muted-foreground">{isClassGroup ? 'Aula em Turma' : classData.subject}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                  {new Date(classData.dateTime).toLocaleDateString("pt-BR")} · {extractTime(classData.dateTime)} – {extractTime(classData.endTime)}
                              </p>
                          </div>
                          <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="size-3.5" />
                                  <span>{classData.status === LessonStatus.SCHEDULED ? 'Agendada' : classData.status === LessonStatus.COMPLETED ? 'Concluída' : 'Cancelada'}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <Label>Status da Sessão</Label>
                      <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => setStatus("attended")} className={`p-4 rounded-xl border-2 transition-all ${status === "attended" ? "border-green-500 bg-green-50" : "border-border hover:border-green-300 hover:bg-green-50/50"}`}>
                              <CheckCircle2 className={`size-7 mx-auto mb-2 ${status === "attended" ? "text-green-600" : "text-muted-foreground"}`} />
                              <p className={`text-sm font-medium ${status === "attended" ? "text-green-700" : "text-muted-foreground"}`}>Realizada</p>
                          </button>

                          <button type="button" onClick={() => setStatus("missed")} className={`p-4 rounded-xl border-2 transition-all ${status === "missed" ? "border-red-500 bg-red-50" : "border-border hover:border-red-300 hover:bg-red-50/50"}`}>
                              <XCircle className={`size-7 mx-auto mb-2 ${status === "missed" ? "text-red-600" : "text-muted-foreground"}`} />
                              <p className={`text-sm font-medium ${status === "missed" ? "text-red-700" : "text-muted-foreground"}`}>Cancelada / Falta</p>
                          </button>
                      </div>
                  </div>

                  {status === "attended" ? (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            Créditos serão deduzidos automaticamente para {isClassGroup ? "todos os integrantes da turma" : "o aluno"} que utilizar pacotes.
                        </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <Info className="size-5 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-800">Nenhum crédito será deduzido.</p>
                    </div>
                  )}

                  {status === "attended" && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="public-notes">Log Público</Label>
                            <Textarea id="public-notes" placeholder="Conteúdo trabalhado..." value={publicNotes} onChange={(e) => setPublicNotes(e.target.value)} rows={2} className="resize-none" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="private-notes">Notas Privadas</Label>
                            <Textarea id="private-notes" placeholder="Observações internas..." value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} rows={2} className="resize-none" />
                        </div>
                    </>
                  )}
              </div>

              <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                      {isSaving ? "Processando..." : (status === "attended" ? "✓ Finalizar Aula" : "✗ Confirmar Cancelamento")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}