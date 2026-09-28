import { useEffect } from 'react';
import { PetSize } from '@/types/hotel';
import { format, differenceInCalendarDays, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UsePriceSimulatorProps {
  petSize: PetSize;
  checkIn: Date;
  checkOut: Date;
  // Valores da diária vindos das Configurações (aba Configurações).
  smallMediumRate?: number;
  largeRate?: number;
  dailyRate?: string;
  discountPercentage?: string;
}

export function usePriceSimulator({
  petSize,
  checkIn,
  checkOut,
  smallMediumRate = 50,
  largeRate = 80,
  dailyRate,
  discountPercentage
}: UsePriceSimulatorProps) {
  const getDefaultRate = (size: PetSize): number =>
    size === 'grande' ? largeRate : smallMediumRate;

  const normalizeDate = (date: Date | string): Date => {
    if (typeof date === 'string') {
      const parsed = parseISO(date);
      return isValid(parsed) ? parsed : new Date();
    }
    return isValid(date) ? date : new Date();
  };

  const normalizedCheckIn = normalizeDate(checkIn);
  const normalizedCheckOut = normalizeDate(checkOut);

  // Diária cobrada por dia corrido ocupado (check-in e check-out contam cada um
  // como uma diária), não por noite — 17→18 são 2 diárias, não 1.
  const days = Math.max(
    1,
    differenceInCalendarDays(normalizedCheckOut, normalizedCheckIn) + 1,
  );

  const defaultDailyRate = getDefaultRate(petSize);

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  const currentDailyRate = dailyRate || defaultDailyRate.toString();
  const currentDiscount = discountPercentage || '0';
  
  const dailyRateNum = parseCurrency(currentDailyRate) || defaultDailyRate;
  const discountNum = parseFloat(currentDiscount) || 0;

  const dailyRateValue = dailyRateNum;
  const calculatedTotalValue = dailyRateValue * days;
  
  const finalTotalValue = calculatedTotalValue * (1 - discountNum / 100);

  const finalDailyRate = finalTotalValue / days;
  const totalValue = finalTotalValue;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return {
    petSize,
    checkIn: normalizedCheckIn,
    checkOut: normalizedCheckOut,
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
    format
  };
}
