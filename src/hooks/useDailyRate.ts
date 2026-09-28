import { useSettings } from "@/hooks/useAPI";
import type { PetSize } from "@/types/hotel";

// Fallbacks usados só enquanto as configurações não chegam do backend.
const FALLBACK_STANDARD = 50;
const FALLBACK_LARGE = 80;

/**
 * Fonte única dos valores da diária de hospedagem (aba Configurações).
 * Usado em toda parte que calcula/exibe o valor da diária.
 */
export function useDailyRate() {
  const { data: settings, isLoading } = useSettings();

  const standardRate = settings?.dailyRateStandard ?? FALLBACK_STANDARD;
  const largeRate = settings?.dailyRateLarge ?? FALLBACK_LARGE;

  const rateForSize = (size: PetSize): number =>
    size === "grande" ? largeRate : standardRate;

  return { standardRate, largeRate, rateForSize, isLoading };
}
