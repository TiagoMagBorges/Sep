import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function TransactionLists({ type, transactions }: { type: "pending" | "recent", transactions: any[] }) {
    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    if (type === "pending") {
        return (
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="size-5 text-destructive" /> Atrasos e Pendências
                </h2>
                {transactions.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardContent className="text-center py-10 text-muted-foreground">
                            <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500" />
                            <p>Todos os pagamentos em dia! 🎉</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div key={t.id} className={`p-4 border-2 rounded-xl ${t.status === "OVERDUE" ? "border-destructive bg-red-50" : "border-orange-300 bg-orange-50"}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{t.classGroupId ? t.classGroupName : t.studentName}</p>
                                            <Badge variant="outline" className={t.status === "OVERDUE" ? "bg-red-100 text-red-800 border-red-300" : "bg-orange-100 text-orange-800 border-orange-300"}>
                                                {t.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Vencimento: {formatDate(t.dueDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{formatCurrency(t.amount)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="size-5" /> Histórico Recente
            </h2>
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${t.status === "PAID" ? "bg-green-100" : t.status === "OVERDUE" ? "bg-red-100" : "bg-orange-100"}`}>
                                        {t.status === "PAID" ? <CheckCircle2 className="size-5 text-green-600" /> : <AlertCircle className={`size-5 ${t.status === "OVERDUE" ? "text-red-600" : "text-orange-600"}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{t.classGroupId ? t.classGroupName : t.studentName}</p>
                                        <p className="text-sm text-muted-foreground truncate">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(t.dueDate)}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="font-bold">{formatCurrency(t.amount)}</p>
                                    <Badge variant="outline" className={t.status === "PAID" ? "bg-green-50 text-green-700 border-green-200" : t.status === "OVERDUE" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                                        {t.status === "PAID" && "Pago"}
                                        {t.status === "OVERDUE" && "Atrasado"}
                                        {t.status === "PENDING" && "Pendente"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}