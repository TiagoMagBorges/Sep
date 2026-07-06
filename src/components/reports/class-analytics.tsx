import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassGroupAnalytics } from "@/types/Report";
import { AlertTriangle, Users, BookOpen } from "lucide-react";

interface ClassAnalyticsProps {
    data: ClassGroupAnalytics;
}

export function ClassAnalyticsReport({ data }: ClassAnalyticsProps) {
    const isAttendanceLow = data.attendanceRate < 75;

    return (
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Assiduidade</CardTitle>
                      <Users className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{data.attendanceRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">de presença média da turma</p>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
                      <BookOpen className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{data.totalLessons}</div>
                      <p className="text-xs text-muted-foreground">no período selecionado</p>
                  </CardContent>
              </Card>
          </div>

          {isAttendanceLow && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl">
                <AlertTriangle className="size-5 text-orange-500 shrink-0" />
                <p className="text-sm font-medium">
                    Atenção: A taxa de assiduidade desta turma está baixa ({data.attendanceRate.toFixed(1)}%).
                </p>
            </div>
          )}

          <Card>
              <CardHeader>
                  <CardTitle>Observações Privadas</CardTitle>
              </CardHeader>
              <CardContent>
                  {data.privateNotes && data.privateNotes.length > 0 ? (
                    <ul className="space-y-4">
                        {data.privateNotes.map((note, index) => (
                          <li key={index} className="border-b pb-3 last:border-0 last:pb-0">
                              <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                              <p className="text-sm">{note.note}</p>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma observação registrada neste período.</p>
                  )}
              </CardContent>
          </Card>
      </div>
    );
}