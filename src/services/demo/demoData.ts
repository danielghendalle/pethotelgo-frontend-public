// Fictional seed data for the public GitHub Pages demo. Nothing here
// represents a real person, pet or booking — names, emails and phone
// numbers are made up for the showcase.
import type {
  Owner,
  Pet,
  Reservation,
  StayHistory,
  AppSettings,
} from "@/types/hotel";

function daysFromNow(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_USER = {
  id: "demo-user-1",
  email: "demo@pethotelgo.com",
  name: "Visitante Demo",
  role: "ADMIN",
};

export const DEMO_CREDENTIALS = {
  email: DEMO_USER.email,
  password: "demo123",
};

export const demoOwners: Owner[] = [
  {
    id: "owner-1",
    name: "Marina Alves Costa",
    email: "marina.costa@example.com",
    phone: "(11) 98765-4321",
    createdAt: daysFromNow(-120) as unknown as Date,
  },
  {
    id: "owner-2",
    name: "Rafael Souza Lima",
    email: "rafael.lima@example.com",
    phone: "(11) 91234-5678",
    createdAt: daysFromNow(-95) as unknown as Date,
  },
  {
    id: "owner-3",
    name: "Juliana Pereira",
    email: "juliana.pereira@example.com",
    phone: "(21) 99876-5432",
    createdAt: daysFromNow(-80) as unknown as Date,
  },
  {
    id: "owner-4",
    name: "Carlos Eduardo Santos",
    email: "carlos.santos@example.com",
    phone: "(21) 98765-1234",
    createdAt: daysFromNow(-60) as unknown as Date,
  },
  {
    id: "owner-5",
    name: "Beatriz Fernandes",
    email: "beatriz.fernandes@example.com",
    phone: "(31) 97654-3210",
    createdAt: daysFromNow(-40) as unknown as Date,
  },
  {
    id: "owner-6",
    name: "Thiago Rodrigues",
    email: "thiago.rodrigues@example.com",
    phone: "(41) 96543-2109",
    createdAt: daysFromNow(-15) as unknown as Date,
  },
];

const defaultNotificationSettings = {
  feeding: true,
  medication: false,
  checkIn: true,
  checkOut: true,
};

const defaultSizeMultiplier = { pequeno: 1, medio: 1.3, grande: 1.6 };

function pet(
  overrides: Partial<Pet> & Pick<Pet, "id" | "owner" | "name" | "breed" | "size">,
): Pet {
  return {
    needsSeparateSpace: false,
    sociability: "media",
    allergies: "",
    specialCare: "",
    feedingSchedule: "2x ao dia (manhã e noite)",
    feedingAmount: "1 xícara",
    createdAt: daysFromNow(-30) as unknown as Date,
    notificationSettings: defaultNotificationSettings,
    baseDailyRate: 50,
    sizeMultiplier: defaultSizeMultiplier,
    ...overrides,
  };
}

export const demoPets: Pet[] = [
  pet({
    id: "pet-1",
    owner: demoOwners[0],
    name: "Thor",
    breed: "Labrador",
    size: "grande",
    sociability: "alta",
    feedingAmount: "2 xícaras",
  }),
  pet({
    id: "pet-2",
    owner: demoOwners[0],
    name: "Mia",
    breed: "Poodle",
    size: "pequeno",
    sociability: "media",
  }),
  pet({
    id: "pet-3",
    owner: demoOwners[1],
    name: "Bidu",
    breed: "Vira-lata",
    size: "medio",
    sociability: "alta",
  }),
  pet({
    id: "pet-4",
    owner: demoOwners[2],
    name: "Luna",
    breed: "Shih Tzu",
    size: "pequeno",
    sociability: "baixa",
    needsSeparateSpace: true,
    allergies: "Ração com frango",
    specialCare: "Evitar contato com cães grandes",
  }),
  pet({
    id: "pet-5",
    owner: demoOwners[3],
    name: "Max",
    breed: "Golden Retriever",
    size: "grande",
    sociability: "alta",
    feedingAmount: "2 xícaras e meia",
  }),
  pet({
    id: "pet-6",
    owner: demoOwners[4],
    name: "Nina",
    breed: "Gato sem raça definida",
    size: "pequeno",
    sociability: "baixa",
    needsSeparateSpace: true,
    specialCare: "Prefere ambientes silenciosos",
  }),
  pet({
    id: "pet-7",
    owner: demoOwners[4],
    name: "Bento",
    breed: "Beagle",
    size: "medio",
    sociability: "alta",
  }),
  pet({
    id: "pet-8",
    owner: demoOwners[5],
    name: "Amora",
    breed: "Bulldog Francês",
    size: "medio",
    sociability: "media",
    specialCare: "Sensível a calor, manter em local ventilado",
  }),
];

export const demoSettings: AppSettings = {
  dailyRateStandard: 60,
  dailyRateLarge: 90,
  updatedAt: daysFromNow(-15),
};

function rateFor(size: Pet["size"]): number {
  return size === "grande"
    ? demoSettings.dailyRateLarge
    : demoSettings.dailyRateStandard;
}

function reservation(
  petRef: Pet,
  checkInOffset: number,
  nights: number,
  status: Reservation["status"],
  opts: { notes?: string; discountPercentage?: number } = {},
): Reservation {
  return {
    id: `res-${petRef.id}-${checkInOffset}`,
    pet: petRef,
    owner: petRef.owner,
    checkIn: daysFromNow(checkInOffset, 14),
    checkOut: daysFromNow(checkInOffset + nights, 11),
    status,
    notes: opts.notes ?? "",
    dailyRate: rateFor(petRef.size),
    discountPercentage: opts.discountPercentage,
    createdAt: daysFromNow(checkInOffset - 3),
  };
}

export const demoReservations: Reservation[] = [
  // Past, already completed stays
  reservation(demoPets[0], -12, 4, "completed", {
    notes: "Primeira estadia, se adaptou bem.",
  }),
  reservation(demoPets[3], -9, 2, "completed"),
  reservation(demoPets[6], -7, 3, "cancelled", {
    notes: "Dono cancelou por viagem remarcada.",
  }),
  // Ongoing / current (spans today)
  reservation(demoPets[1], -1, 3, "confirmed", {
    notes: "Trazer manta própria para dormir.",
  }),
  reservation(demoPets[4], -2, 5, "confirmed", {
    discountPercentage: 10,
  }),
  // Upcoming
  reservation(demoPets[2], 1, 2, "confirmed"),
  reservation(demoPets[5], 2, 4, "pending", {
    notes: "Aguardando confirmação do cartão de vacina.",
  }),
  reservation(demoPets[7], 3, 3, "confirmed"),
  reservation(demoPets[0], 6, 2, "pending"),
  reservation(demoPets[3], 8, 1, "confirmed"),
  reservation(demoPets[6], 10, 5, "confirmed", {
    notes: "Reserva para o feriado, confirmar diária de fim de semana.",
  }),
  reservation(demoPets[1], 13, 2, "confirmed"),
];

export const demoStayHistory: StayHistory[] = [
  {
    id: "stay-1",
    petId: demoPets[0].id,
    reservationId: "res-pet-1--12",
    checkIn: daysFromNow(-12, 14) as unknown as Date,
    checkOut: daysFromNow(-8, 11) as unknown as Date,
    behavior: "Tranquilo e sociável, brincou bem com os outros pets.",
    notes: "Comeu toda a ração oferecida, sem intercorrências.",
  },
  {
    id: "stay-2",
    petId: demoPets[3].id,
    reservationId: "res-pet-4--9",
    checkIn: daysFromNow(-9, 14) as unknown as Date,
    checkOut: daysFromNow(-7, 11) as unknown as Date,
    behavior: "Um pouco ansiosa no primeiro dia, melhorou depois.",
    notes: "Manteve espaço separado conforme solicitado pela tutora.",
  },
];
