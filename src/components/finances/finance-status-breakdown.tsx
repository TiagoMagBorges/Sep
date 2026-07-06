import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function FinanceStatusBreakdown({ metrics }: { metrics: any }) {
    return (
      <div>
          <h2 className="text-xl font-semibold mb-4">Detalhamento do Status de Pagamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50/30 shadow-sm">
                  <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                          <CheckCircle2 className="size-5 text-green-600" />
                          <span className="font-medium text-green-800">Pago</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(metrics.paidAmount)}</p>
                      <p className="text-sm text-green-600 mt-1">{metrics.paidCount} transações</p>
                  </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/30 shadow-sm">
                  <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="size-5 text-red-500" />
                          <span className="font-medium text-red-800">Atrasado</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(metrics.overdueAmount)}</p>
                      <p className="text-sm text-red-600 mt-1">{metrics.overdueCount} transações</p>
                  </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/30 shadow-sm">
                  <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="size-5 text-orange-500" />
                          <span className="font-medium text-orange-800">Pendente</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(metrics.unpaidAmount)}</p>
                      <p className="text-sm text-orange-600 mt-1">{metrics.unpaidCount} transações</p>
                  </CardContent>
              </Card>
          </div>
      </div>
    );
}