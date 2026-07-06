import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function FinanceChart({ data }: { data: any[] }) {
    return (
      <Card className="shadow-sm">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" /> Tendências de Ganhos
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.02} />
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} textAnchor="end" />
                          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Ganhos"]} />
                          <Area type="monotone" dataKey="value" stroke="#0F4C81" strokeWidth={2.5} fill="url(#colorValue)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </CardContent>
      </Card>
    );
}