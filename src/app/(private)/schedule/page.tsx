"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, LayoutGrid, List } from "lucide-react";
import { api } from "@/services/api";
import { useSchedule } from "@/hooks/useSchedule";
import { Lesson, LessonStatus, LessonRequest } from "@/types/Lesson";
import { Student, PageableResponse } from "@/types/Student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewClassModal } from "@/components/new-class-modal";
import { QuickClassFinishModal } from "@/components/quick-class-finish-modal";
import { MonthGrid } from "@/components/schedule/month-grid";
import { WeekGrid } from "@/components/schedule/week-grid";

type ViewMode = 'month' | 'week';

export default function SchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');

    const { lessons, isLoading, error, saveLesson } = useSchedule(currentDate);
    const [studentsList, setStudentsList] = useState<Student[]>([]);

    const [isNewClassOpen, setIsNewClassOpen] = useState(false);
    const [selectedFinishClass, setSelectedFinishClass] = useState<Lesson | null>(null);
    const [clickDate, setClickDate] = useState<Date | undefined>(undefined);
    const [clickTime, setClickTime] = useState<string | undefined>(undefined);

    useEffect(() => {
        api.get<PageableResponse<Student>>("/students?size=100")
            .then(res => setStudentsList(res.data.content));
    }, []);

    const handleGridClick = (date: Date, hour: number) => {
        setClickDate(date);
        setClickTime(`${String(hour).padStart(2, '0')}:00`);
        setIsNewClassOpen(true);
    };

    const handleStatusUpdate = async (id: string, newStatus: LessonStatus) => {
        const lesson = lessons.find(l => l.id === id);
        if (!lesson) return;

        const payload: LessonRequest = {
            studentId: lesson.studentId,
            dateTime: lesson.dateTime,
            endTime: lesson.endTime,
            status: newStatus
        };

        await saveLesson(id, payload);
        setSelectedFinishClass(null);
    };

    const getWeekDays = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const currentWeekDays = getWeekDays(currentDate);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
                    <p className="text-muted-foreground mt-1">Sua grade temporal de aulas.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex p-1 bg-muted rounded-lg">
                        <Button variant={viewMode === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('week')} className="gap-2">
                            <List className="size-4" /> Semana
                        </Button>
                        <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('month')} className="gap-2">
                            <LayoutGrid className="size-4" /> Mês
                        </Button>
                    </div>
                    <Button onClick={() => handleGridClick(new Date(), 14)} className="gap-2">
                        <Plus className="size-4" /> Nova Aula
                    </Button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
                    <AlertCircle className="size-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <Card className="shadow-sm border-none bg-transparent sm:bg-card sm:border">
                <CardHeader className="px-0 sm:px-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="capitalize text-lg">
                            {viewMode === 'week' ? `Semana de ${currentWeekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}` : currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - (viewMode === 'week' ? 7 : 30)))}>
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (viewMode === 'week' ? 7 : 30)))}>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 sm:px-6 overflow-x-auto pb-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando calendário...</div>
                    ) : (
                        viewMode === 'week' ? (
                            <WeekGrid
                                currentDate={currentDate}
                                lessons={lessons}
                                onGridClick={handleGridClick}
                                onLessonSelect={setSelectedFinishClass}
                            />
                        ) : (
                            <MonthGrid
                                currentDate={currentDate}
                                lessons={lessons}
                                onGridClick={handleGridClick}
                                onLessonSelect={setSelectedFinishClass}
                            />
                        )
                    )}
                </CardContent>
            </Card>

            <NewClassModal
                open={isNewClassOpen}
                onClose={() => setIsNewClassOpen(false)}
                onSave={async (payload) => saveLesson(null, payload)}
                studentsList={studentsList}
                initialDate={clickDate}
                initialTime={clickTime}
            />

            {selectedFinishClass && (
                <QuickClassFinishModal
                    classData={selectedFinishClass}
                    open={!!selectedFinishClass}
                    onClose={() => setSelectedFinishClass(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}