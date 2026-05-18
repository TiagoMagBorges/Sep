import { DollarSign, AlertCircle, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function FinanceMetrics({ metrics }: { metrics: any }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Visão Geral Financeira</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Ganhos totais</span>
                            <div className="size-9 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="size-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalIncome)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Receita confirmada</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Pendentes</span>
                            <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertCircle className="size-4 text-orange-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.pendingAmount)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Aulas não remuneradas</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Sessões Concluídas</span>
                            <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <BookOpen className="size-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-primary">{metrics.totalLessons}</p>
                        <p className="text-xs text-muted-foreground mt-1">Indiv. e Turmas</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Taxa média</span>
                            <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center">
                                <Clock className="size-4 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.avgHourlyRate)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Por sessão concluída</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}