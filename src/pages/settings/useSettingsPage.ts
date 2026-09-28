import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "@/hooks/useAPI";

const settingsSchema = z.object({
  dailyRateStandard: z
    .string()
    .min(1, "Informe o valor da diária"),
  dailyRateLarge: z
    .string()
    .min(1, "Informe o valor da diária"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

/** "1234,50" | "R$ 1.234,50" -> 1234.5 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[R$\s.]/g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

/** digits typed -> "R$ 1.234,50" (cents-based mask, like the reservation form) */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(number);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function useSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { dailyRateStandard: "", dailyRateLarge: "" },
  });

  // Preenche o formulário quando os dados chegam do backend.
  useEffect(() => {
    if (settings) {
      reset({
        dailyRateStandard: formatCurrency(settings.dailyRateStandard),
        dailyRateLarge: formatCurrency(settings.dailyRateLarge),
      });
    }
  }, [settings, reset]);

  const handleCurrencyChange =
    (field: keyof SettingsFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, formatCurrencyInput(e.target.value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    };

  const standardValue = parseCurrency(watch("dailyRateStandard"));
  const largeValue = parseCurrency(watch("dailyRateLarge"));

  const onSubmit = handleSubmit((data) => {
    const dailyRateStandard = parseCurrency(data.dailyRateStandard);
    const dailyRateLarge = parseCurrency(data.dailyRateLarge);

    if (dailyRateStandard <= 0 || dailyRateLarge <= 0) {
      return;
    }

    updateSettings.mutate(
      { dailyRateStandard, dailyRateLarge },
      {
        onSuccess: (updated) =>
          reset({
            dailyRateStandard: formatCurrency(updated.dailyRateStandard),
            dailyRateLarge: formatCurrency(updated.dailyRateLarge),
          }),
      },
    );
  });

  return {
    settings,
    isLoading,
    isError,
    refetch,
    register,
    errors,
    isDirty,
    isSaving: updateSettings.isPending,
    standardValue,
    largeValue,
    handleCurrencyChange,
    onSubmit,
    formatCurrency,
  };
}
