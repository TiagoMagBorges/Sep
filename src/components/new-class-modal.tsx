import { useState, useEffect } from "react";
import { format, addHours, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Users, User } from "lucide-react";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Student } from "@/types/Student";
import { ClassGroup, ClassGroupPageableResponse } from "@/types/ClassGroup";
import { LessonRequest, LessonStatus } from "@/types/Lesson";

interface NewClassModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (payload: LessonRequest) => Promise<boolean>;
    studentsList: Student[];
    initialDate?: Date;
    initialTime?: string;
}

export function NewClassModal({ open, onClose, onSave, studentsList, initialDate, initialTime }: NewClassModalProps) {
    const [mode, setMode] = useState<"student" | "class">("student");
    const [classGroupsList, setClassGroupsList] = useState<ClassGroup[]>([]);

    const [studentId, setStudentId] = useState("");
    const [classGroupId, setClassGroupId] = useState("");

    const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
    const [time, setTime] = useState(initialTime || "14:00");
    const [duration, setDuration] = useState("1");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            api.get<ClassGroupPageableResponse>("/class-groups?size=100")
              .then(res => setClassGroupsList(res.data.content))
              .catch(console.error);

            const timeoutId = setTimeout(() => {
                setDate(initialDate || new Date());
                setTime(initialTime || "14:00");
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [open, initialDate, initialTime]);

    const handleSave = async () => {
        if ((mode === "student" && !studentId) || (mode === "class" && !classGroupId) || !date || !time) return;

        setIsSaving(true);

        const dateString = format(date, "yyyy-MM-dd");
        const startDateTime = `${dateString}T${time}:00`;
        const parsedStartTime = parse(time, "HH:mm", date);
        const durationValue = parseFloat(duration);
        const hours = Math.floor(durationValue);
        const minutes = (durationValue - hours) * 60;
        const endTimeObj = addMinutes(addHours(parsedStartTime, hours), minutes);
        const endDateTime = `${dateString}T${format(endTimeObj, "HH:mm")}:00`;

        const payload: LessonRequest = {
            dateTime: startDateTime,
            endTime: endDateTime,
            status: LessonStatus.SCHEDULED,
            publicLog: notes
        };

        if (mode === "student") payload.studentId = studentId;
        if (mode === "class") payload.classGroupId = classGroupId;

        const success = await onSave(payload);
        setIsSaving(false);
        if (success) {
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setStudentId("");
        setClassGroupId("");
        setDuration("1");
        setNotes("");
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const isFormValid = (mode === "student" ? !!studentId : !!classGroupId) && !!date && !!time;

    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Nova Aula</DialogTitle>
                  <DialogDescription>Agende uma nova sessão no calendário.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                  <div className="flex p-1 bg-muted rounded-lg w-full">
                      <Button
                        type="button"
                        variant={mode === "student" ? "secondary" : "ghost"}
                        className="w-1/2 gap-2"
                        onClick={() => { setMode("student"); setStudentId(""); setClassGroupId(""); }}
                      >
                          <User className="size-4" /> Aluno Individual
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
                        <Label htmlFor="student">Selecionar Aluno</Label>
                        <Select value={studentId} onValueChange={setStudentId}>
                            <SelectTrigger id="student">
                                <SelectValue placeholder="Busque um aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {studentsList.filter(s => s.active).map((student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                      {student.name} - {student.subject}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  )}

                  {mode === "class" && (
                    <div className="space-y-2">
                        <Label htmlFor="class">Selecionar Turma</Label>
                        <Select value={classGroupId} onValueChange={setClassGroupId}>
                            <SelectTrigger id="class">
                                <SelectValue placeholder="Busque uma turma..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classGroupsList.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                      {group.name} ({group.students?.length || 0} alunos)
                                  </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                          <Label>Data</Label>
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      <CalendarIcon className="mr-2 size-4" />
                                      {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span className="text-gray-500">Selecionar data</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                              </PopoverContent>
                          </Popover>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="time">Horário</Label>
                          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="duration">Duração</Label>
                      <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger id="duration">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0.5">30 minutos</SelectItem>
                              <SelectItem value="1">1 hora</SelectItem>
                              <SelectItem value="1.5">1 hora e 30 minutos</SelectItem>
                              <SelectItem value="2">2 horas</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="notes">Observações Iniciais</Label>
                      <Textarea id="notes" placeholder="Tópicos que serão abordados..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </div>
              </div>

              <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={!isFormValid || isSaving} className="bg-[#0F4C81] hover:bg-[#0F4C81]/90">
                      {isSaving ? "Agendando..." : "Agendar Aula"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}