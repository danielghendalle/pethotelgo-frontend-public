import { motion } from "framer-motion";
import { DollarSign, Loader2, PawPrint, Save, Settings as SettingsIcon } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettingsPage } from "./useSettingsPage";

export function SettingsPage() {
  const {
    settings,
    isLoading,
    isError,
    refetch,
    register,
    errors,
    isDirty,
    isSaving,
    standardValue,
    largeValue,
    handleCurrencyChange,
    onSubmit,
    formatCurrency,
  } = useSettingsPage();

  return (
    <MainLayout
      title="Configurações"
      subtitle="Ajuste os valores usados no hotel"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando configurações...
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Não foi possível carregar as configurações
          </h3>
          <p className="text-muted-foreground mb-4">
            Verifique sua conexão e tente novamente.
          </p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-3xl"
        >
          {/* Stats Cards — valores em vigor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-card p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Diária — porte pequeno e médio
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatCurrency(standardValue)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="bg-card p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Diária — porte grande
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatCurrency(largeValue)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Valores da hospedagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Estes são os valores da diária aplicados por padrão a novas
                  reservas. Quem cria a reserva ainda pode informar um valor
                  diferente para um caso específico.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dailyRateStandard">
                      Diária — porte pequeno e médio
                    </Label>
                    <Input
                      id="dailyRateStandard"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      {...register("dailyRateStandard")}
                      onChange={handleCurrencyChange("dailyRateStandard")}
                    />
                    {errors.dailyRateStandard && (
                      <p className="text-xs text-destructive">
                        {errors.dailyRateStandard.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyRateLarge">Diária — porte grande</Label>
                    <Input
                      id="dailyRateLarge"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      {...register("dailyRateLarge")}
                      onChange={handleCurrencyChange("dailyRateLarge")}
                    />
                    {errors.dailyRateLarge && (
                      <p className="text-xs text-destructive">
                        {errors.dailyRateLarge.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    {settings?.updatedAt
                      ? `Última alteração: ${settings.updatedAt}`
                      : null}
                  </p>
                  <Button
                    type="submit"
                    disabled={
                      isSaving ||
                      !isDirty ||
                      standardValue <= 0 ||
                      largeValue <= 0
                    }
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </MainLayout>
  );
}
