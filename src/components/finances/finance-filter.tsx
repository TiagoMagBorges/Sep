import { Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FinanceFilterProps {
    startDate: string;
    endDate: string;
    setStartDate: (v: string) => void;
    setEndDate: (v: string) => void;
    onApply: () => void;
    onClear: () => void;
    isApplied: boolean;
}

export function FinanceFilter({ startDate, endDate, setStartDate, setEndDate, onApply, onClear, isApplied }: FinanceFilterProps) {
    return (
      <Card className="shadow-sm">
          <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 space-y-1 w-full">
                      <Label className="text-sm">Data de início</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-1 w-full">
                      <Label className="text-sm">Data de término</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                      <Button onClick={onApply} className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2">
                          <Filter className="size-4" /> Aplicar
                      </Button>
                      {isApplied && (
                        <Button variant="outline" onClick={onClear} className="w-full sm:w-auto">
                            Limpar
                        </Button>
                      )}
                  </div>
              </div>
          </CardContent>
      </Card>
    );
}