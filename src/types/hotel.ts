// Types for the Pet Hotel Management System

export type PetSize = 'pequeno' | 'medio' | 'grande';
export type SociabilityLevel = 'baixa' | 'media' | 'alta';

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface CreatePetData {
  name: string;
  breed: string;
  size: PetSize;
  needsSeparateSpace: boolean;
  sociability: SociabilityLevel;
  allergies: string;
  specialCare: string;
  feedingSchedule: string;
  feedingAmount: string;
  vaccinationCardUrl?: string;
  ownerId: string;
}

export interface Pet {
  id: string;
  owner: Owner; // Backend retorna objeto owner completo
  name: string;
  breed: string;
  size: PetSize;
  needsSeparateSpace: boolean;
  sociability: SociabilityLevel;
  allergies: string;
  specialCare: string;
  feedingSchedule: string;
  feedingAmount: string;
  vaccinationCardUrl?: string;
  createdAt: Date;
  // Campos de notificação
  notificationSettings: {
    feeding: boolean;
    medication: boolean;
    checkIn: boolean;
    checkOut: boolean;
    customReminders?: string[];
  };
  // Campos para cálculo de diária
  baseDailyRate: number;
  sizeMultiplier: {
    pequeno: number;
    medio: number;
    grande: number;
  };
}

export interface CreateReservationData {
  petId: string;
  ownerId: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
  dailyRate?: number;
  discountPercentage?: number;
}

export interface Reservation {
  id: string;
  pet: Pet;
  owner: Owner;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
  dailyRate?: number;
  discountPercentage?: number;
  createdAt: string;
}

export interface StayHistory {
  id: string;
  petId: string;
  reservationId: string;
  checkIn: Date;
  checkOut: Date;
  behavior: string;
  notes: string;
}

export interface DayCapacity {
  date: Date;
  totalPets: number;
  isFull: boolean;
  reservations: Reservation[];
}

export type CalendarView = 'day' | 'week' | 'month';

// Configurações globais editáveis pelo operador (aba Configurações).
export interface AppSettings {
  // Valor da diária de hospedagem para pets de porte pequeno e médio.
  dailyRateStandard: number;
  // Valor da diária de hospedagem para pets de porte grande.
  dailyRateLarge: number;
  updatedAt: string;
}

export interface UpdateSettingsData {
  dailyRateStandard: number;
  dailyRateLarge: number;
}
