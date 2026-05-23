"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPaymentModal } from "@/components/add-payment-modal";
import { useFinances } from "@/hooks/useFinances";
import { useSchedule } from "@/hooks/useSchedule";
import { LessonStatus } from "@/types/Lesson";
import { FinanceFilter } from "@/components/finances/finance-filter";
import { FinanceMetrics } from "@/components/finances/finance-metrics";
import { FinanceChart } from "@/components/finances/finance-chart";
import { FinanceStatusBreakdown } from "@/components/finances/finance-status-breakdown";
import { RevenueByClient } from "@/components/finances/revenue-by-client";
import { TransactionLists } from "@/components/finances/transaction-lists";

export default function FinancesPage() {
    const today = useMemo(() => new Date(), []);

    const [startDate, setStartDate] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
    const [filterApplied, setFilterApplied] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

    const { transactions, saveFinance } = useFinances(startDate, endDate);
    const { lessons } = useSchedule(today);

    const completedClasses = useMemo(() =>
            lessons.filter((c) => c.status === LessonStatus.COMPLETED),
        [lessons]);

    const metrics = useMemo(() => {
        const paid = transactions.filter(t => t.status === "PAID");
        const pending = transactions.filter(t => t.status === "PENDING");
        const overdue = transactions.filter(t => t.status === "OVERDUE");

        const paidAmount = paid.reduce((acc, t) => acc + t.amount, 0);
        const unpaidAmount = pending.reduce((acc, t) => acc + t.amount, 0);
        const overdueAmount = overdue.reduce((acc, t) => acc + t.amount, 0);

        const totalIncome = paidAmount;
        const pendingAmount = unpaidAmount + overdueAmount;
        const totalLessons = completedClasses.length;
        const avgHourlyRate = totalLessons > 0 ? totalIncome / totalLessons : 0;

        return {
            paidAmount, unpaidAmount, overdueAmount,
            paidCount: paid.length, unpaidCount: pending.length, overdueCount: overdue.length,
            totalIncome, pendingAmount, totalLessons, avgHourlyRate
        };
    }, [transactions, completedClasses]);

    const revenueByClient = useMemo(() => {
        const map = new Map();

        transactions.forEach(t => {
            const isGroup = !!t.classGroupId;
            const entityId = isGroup ? t.classGroupId : t.studentId;
            const entityName = isGroup ? t.classGroupName : t.studentName;

            if (!map.has(entityId)) {
                map.set(entityId, {
                    id: entityId, name: entityName, isGroup,
                    totalRevenue: 0, pendingRevenue: 0, totalLessons: 0
                });
            }
            const s = map.get(entityId);
            if (t.status === "PAID") s.totalRevenue += t.amount;
            else s.pendingRevenue += t.amount;
        });

        completedClasses.forEach(l => {
            const isGroup = !!l.classGroupId;
            const entityId = isGroup ? l.classGroupId : l.studentId;
            if (map.has(entityId)) {
                map.get(entityId).totalLessons += 1;
            }
        });

        return Array.from(map.values());
    }, [transactions, completedClasses]);

    const monthlyEarningsData = useMemo(() => {
        const map = new Map<string, number>();
        transactions.filter(t => t.status === "PAID").forEach(t => {
            const month = format(parseISO(t.dueDate), "MMM", { locale: ptBR });
            map.set(month, (map.get(month) || 0) + t.amount);
        });
        return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
    }, [transactions]);

    const pendingTransactions = useMemo(() =>
            transactions.filter(t => t.status === "PENDING" || t.status === "OVERDUE"),
        [transactions]);

    const recentTransactions = useMemo(() =>
            [...transactions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).slice(0, 8),
        [transactions]);

    const handleApplyFilter = () => setFilterApplied(true);
    const handleClearFilter = () => {
        setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        setFilterApplied(false);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="rounded-2xl bg-primary px-6 py-8 text-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Painel Financeiro</h1>
                        <p className="mt-1 text-white/75">
                            Acompanhe seus ganhos, monitore tendências e gerencie pagamentos pendentes.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddPaymentModalOpen(true)}
                        className="bg-white text-primary hover:bg-white/90 gap-2"
                    >
                        <Plus className="size-4" /> Registrar Pagamento
                    </Button>
                </div>
            </div>

            <FinanceFilter
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                onApply={handleApplyFilter}
                onClear={handleClearFilter}
                isApplied={filterApplied}
            />

            <FinanceMetrics metrics={metrics} />

            <FinanceChart data={monthlyEarningsData} />

            <FinanceStatusBreakdown metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueByClient data={revenueByClient} />
                <TransactionLists
                    type="pending"
                    transactions={pendingTransactions}
                />
            </div>

            <TransactionLists
                type="recent"
                transactions={recentTransactions}
            />

            <AddPaymentModal
                open={isAddPaymentModalOpen}
                onOpenChange={setIsAddPaymentModalOpen}
                onSave={saveFinance}
            />
        </div>
    );
}