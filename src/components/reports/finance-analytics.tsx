import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceAnalytics } from "@/types/Report";
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";

interface FinanceAnalyticsProps {
    data: FinanceAnalytics;
}

export function FinanceAnalyticsReport({ data }: FinanceAnalyticsProps) {
    const formatCurrency = (value: number) => {
        // Fallback de segurança caso o valor seja undefined
        if (value === undefined || value === null) return "R$ 0,00";
        
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-100 dark:border-green-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                    <ArrowUpRight className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(data.totalPaid)} {/* Alterado aqui */}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-yellow-100 dark:border-yellow-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
                    <Clock className="size-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(data.totalPending)}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-100 dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Atrasado</CardTitle>
                    <ArrowDownRight className="size-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(data.totalOverdue)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}