import { Lesson } from "@/types/Lesson";

interface WeekGridProps {
    currentDate: Date;
    lessons: Lesson[];
    onGridClick: (date: Date, hour: number) => void;
    onLessonSelect: (lesson: Lesson) => void;
}

export function WeekGrid({ currentDate, lessons, onGridClick, onLessonSelect }: WeekGridProps) {
    const START_HOUR = 7;
    const END_HOUR = 22;
    const hoursCount = END_HOUR - START_HOUR + 1;
    const hours = Array.from({ length: hoursCount }).map((_, i) => START_HOUR + i);

    const extractTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const getLocalDateString = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
        <div className="flex border rounded-lg bg-background overflow-hidden relative min-w-[700px]">
            <div className="w-16 shrink-0 border-r bg-muted/20">
                <div className="h-12 border-b" />
                {hours.map(hour => (
                    <div key={hour} className="h-[60px] border-b border-border/50 text-right pr-2 text-xs text-muted-foreground -mt-2">
                        {String(hour).padStart(2, '0')}:00
                    </div>
                ))}
            </div>

            <div className="flex-1 flex">
                {currentWeekDays.map((day, dayIndex) => {
                    const dateStr = getLocalDateString(day);
                    const dayLessons = lessons.filter(l => l.dateTime.startsWith(dateStr));
                    const isToday = dateStr === getLocalDateString(new Date());

                    return (
                        <div key={dayIndex} className="flex-1 border-r last:border-r-0 relative">
                            <div className={`h-12 border-b flex flex-col items-center justify-center ${isToday ? 'bg-primary/10 text-primary' : 'bg-muted/10'}`}>
                                <span className="text-xs font-medium uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                                <span className={`text-lg ${isToday ? 'font-bold' : ''}`}>{day.getDate()}</span>
                            </div>

                            <div className="relative" style={{ height: `${hoursCount * 60}px` }}>
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        onClick={() => onGridClick(day, hour)}
                                        className="h-[60px] border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                                    />
                                ))}

                                {dayLessons.map(lesson => {
                                    const start = new Date(lesson.dateTime);
                                    const end = new Date(lesson.endTime);

                                    const topOffset = ((start.getHours() - START_HOUR) * 60) + start.getMinutes();
                                    const durationMins = (end.getTime() - start.getTime()) / 60000;

                                    if (topOffset < 0) return null;

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={(e) => { e.stopPropagation(); onLessonSelect(lesson); }}
                                            className="absolute left-1 right-1 rounded-md p-1.5 text-xs overflow-hidden cursor-pointer shadow-sm hover:ring-2 hover:ring-primary/50 transition-all bg-blue-100 text-blue-800 border border-blue-200 z-10"
                                            style={{ top: `${topOffset}px`, height: `${durationMins}px` }}
                                        >
                                            <div className="font-semibold truncate">{lesson.studentName.split(' ')[0]}</div>
                                            <div className="text-[10px] opacity-80">{extractTime(lesson.dateTime)} - {extractTime(lesson.endTime)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}