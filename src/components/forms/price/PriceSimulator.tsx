import { Calculator, Info, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PetSize } from "@/types/hotel";
import { useDailyRate } from "@/hooks/useDailyRate";
import { usePriceSimulator } from "./usePriceSimulator";

interface PriceSimulatorProps {
  petSize: PetSize;
  checkIn: Date;
  checkOut: Date;
  dailyRate?: string;
  discountPercentage?: string;
}

export function PriceSimulator({
  petSize,
  checkIn,
  checkOut,
  dailyRate,
  discountPercentage,
}: PriceSimulatorProps) {
  const { standardRate, largeRate } = useDailyRate();

  const {
    days,
    defaultDailyRate,
    currentDailyRate,
    currentDiscount,
    dailyRateNum,
    discountNum,
    dailyRateValue,
    calculatedTotalValue,
    finalTotalValue,
    finalDailyRate,
    totalValue,
    formatCurrency,
    format,
  } = usePriceSimulator({
    petSize,
    checkIn,
    checkOut,
    smallMediumRate: standardRate,
    largeRate,
    dailyRate,
    discountPercentage,
  });

  const getDefaultRate = (size: string): number =>
    size === "grande" ? largeRate : standardRate;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Simulador de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Valores de Referência por Porte:
            </span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <div>• Pet Pequeno: {formatCurrency(standardRate)} por dia</div>
            <div>• Pet Médio: {formatCurrency(standardRate)} por dia</div>
            <div>• Pet Grande: {formatCurrency(largeRate)} por dia</div>
            <div className="text-xs text-amber-600 mt-2 italic">
              Porte atual: <span className="font-medium">{petSize}</span> -
              Valor sugerido:{" "}
              <span className="font-medium">
                {formatCurrency(getDefaultRate(petSize))} por dia
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Período Selecionado:</span>
            <span className="text-muted-foreground">
              {format(checkIn, "dd/MM/yyyy")} - {format(checkOut, "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="font-medium">Dias:</span>
            <span className="text-muted-foreground">
              {days} {days === 1 ? "dia" : "dias"}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Como é feito o cálculo:
              </span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>
                • Valor da diária informado: R$ {dailyRateValue.toFixed(2)}
              </div>
              <div>• Número de dias: {days}</div>
              <div>
                • Valor total calculado: R$ {calculatedTotalValue.toFixed(2)}
              </div>
              <div>• Desconto aplicado: {discountNum}%</div>
              <div className="font-medium mt-2 pt-2 border-t border-blue-200">
                Fórmula: Valor total = Valor da diária × Número de dias
              </div>
              <div className="font-medium text-blue-800">
                R$ {dailyRateValue.toFixed(2)} × {days} = R${" "}
                {calculatedTotalValue.toFixed(2)}
              </div>
              {discountNum > 0 && (
                <div className="font-medium text-blue-800 mt-1">
                  Desconto ({discountNum}%): R${" "}
                  {calculatedTotalValue.toFixed(2)} ×{" "}
                  {(discountNum / 100).toFixed(2)} = R${" "}
                  {(calculatedTotalValue * (discountNum / 100)).toFixed(2)}
                </div>
              )}
              {discountNum > 0 && (
                <div className="font-medium text-blue-800 mt-1">
                  Valor final: R$ {calculatedTotalValue.toFixed(2)} - R${" "}
                  {(calculatedTotalValue * (discountNum / 100)).toFixed(2)} = R${" "}
                  {finalTotalValue.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span>Período:</span>
            <span>
              {days} {days === 1 ? "dia" : "dias"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Valor da diária:</span>
            <span className="font-medium">
              R$ {dailyRateValue.toFixed(2)}/dia
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>
              Subtotal ({days} dias × R$ {dailyRateValue.toFixed(2)}):
            </span>
            <span>R$ {calculatedTotalValue.toFixed(2)}</span>
          </div>

          {discountNum > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <div>
                <span>Desconto ({discountNum}%):</span>
                <div className="text-xs text-muted-foreground mt-1">
                  R$ {calculatedTotalValue.toFixed(2)} × {discountNum}% = R${" "}
                  {((calculatedTotalValue * discountNum) / 100).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span>
                  -R$ {((calculatedTotalValue * discountNum) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Valor Total:</span>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  R$ {totalValue.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {discountNum > 0 ? (
                    <span>Com {discountNum}% de desconto</span>
                  ) : (
                    <span>Valor calculado</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  R$ {finalDailyRate.toFixed(2)} por dia
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Porte: {petSize}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {days} {days === 1 ? "dia" : "dias"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            R$ {dailyRateValue.toFixed(2)}/dia
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
