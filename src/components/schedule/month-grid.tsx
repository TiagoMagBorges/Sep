import { Lesson } from "@/types/Lesson";

interface MonthGridProps {
    currentDate: Date;
    lessons: Lesson[];
    onGridClick: (date: Date, hour: number) => void;
    onLessonSelect: (lesson: Lesson) => void;
}

export function MonthGrid({ currentDate, lessons, onGridClick, onLessonSelect }: MonthGridProps) {
    const weekDaysNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const extractTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const getLocalDateString = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    return (
        <div className="flex flex-col min-w-[700px]">
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDaysNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-muted/20 rounded-lg" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const targetDate = new Date(year, month, day);
                    const dateStr = getLocalDateString(targetDate);
                    const dayLessons = lessons.filter(l => l.dateTime.startsWith(dateStr));
                    const isToday = dateStr === getLocalDateString(new Date());

                    return (
                        <div
                            key={day}
                            className={`aspect-square flex flex-col border rounded-lg p-1.5 hover:bg-accent/50 transition-colors cursor-pointer ${isToday ? "border-2 border-primary bg-primary/5" : "border-border"}`}
                            onClick={() => onGridClick(targetDate, 14)}
                        >
                            <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                                {day}
                            </div>
                            <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                                {dayLessons.slice(0, 3).map(lesson => (
                                    <div
                                        key={lesson.id}
                                        onClick={(e) => { e.stopPropagation(); onLessonSelect(lesson); }}
                                        className="text-[10px] px-1.5 py-1 rounded truncate transition-opacity hover:opacity-80 bg-blue-100 text-blue-800 border border-blue-200"
                                        title={`${extractTime(lesson.dateTime)} - ${lesson.studentName}`}
                                    >
                                        <span className="font-semibold">{extractTime(lesson.dateTime)}</span> {lesson.studentName.split(' ')[0]}
                                    </div>
                                ))}
                                {dayLessons.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground text-center font-medium">
                                        +{dayLessons.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}