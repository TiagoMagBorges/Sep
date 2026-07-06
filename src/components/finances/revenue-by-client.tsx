import { useState } from "react";
import { Users, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function RevenueByClient({ data }: { data: any[] }) {
  const [viewMode, setViewMode] = useState<"students" | "classes">("students");

  const filteredData = data.filter(item => viewMode === "classes" ? item.isGroup : !item.isGroup);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Receita Detalhada</h2>
        <div className="flex p-1 bg-muted rounded-lg w-full sm:w-max">
          <Button
            type="button"
            variant={viewMode === "students" ? "secondary" : "ghost"}
            className="w-1/2 sm:w-auto gap-2"
            onClick={() => setViewMode("students")}
          >
            <User className="size-4" /> Alunos Individuais
          </Button>
          <Button
            type="button"
            variant={viewMode === "classes" ? "secondary" : "ghost"}
            className="w-1/2 sm:w-auto gap-2"
            onClick={() => setViewMode("classes")}
          >
            <Users className="size-4" /> Turmas
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredData.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum dado de {viewMode === "students" ? "alunos" : "turmas"} no período.
          </p>
        )}
        {filteredData.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {item.isGroup ? <Users className="size-5 text-primary" /> : <span className="font-bold text-primary text-sm">{item.name?.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                        {item.totalLessons} sessões no período
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Recebido (PAID)</p>
                      <p className="font-bold text-green-600">{formatCurrency(item.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">A Receber (PENDING/OVERDUE)</p>
                      <p className="font-bold text-orange-600">{formatCurrency(item.pendingRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}