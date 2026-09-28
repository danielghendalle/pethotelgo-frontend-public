// In-memory "database" for the public demo build. Reseeded from
// demoData.ts on every full page load — nothing is persisted, so every
// visitor (and every reload) starts from the same clean fictional dataset.
import type {
  Owner,
  Pet,
  Reservation,
  StayHistory,
  AppSettings,
  CreatePetData,
  CreateReservationData,
} from "@/types/hotel";
import {
  demoOwners,
  demoPets,
  demoReservations,
  demoStayHistory,
  demoSettings,
} from "./demoData";
import type { VaccinationCardResponse } from "../pets/vaccinationCard/vaccinationCardApi";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

let owners: Owner[] = clone(demoOwners);
let pets: Pet[] = clone(demoPets);
let reservations: Reservation[] = clone(demoReservations);
let stayHistory: StayHistory[] = clone(demoStayHistory);
let settings: AppSettings = clone(demoSettings);
const vaccinationCards = new Map<string, VaccinationCardResponse>();

let nextId = 1000;
function newId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export class DemoNotFoundError extends Error {}

// ---- Owners ----------------------------------------------------------

export function listOwners(): Owner[] {
  return owners;
}

export function getOwner(id: string): Owner {
  const found = owners.find((o) => o.id === id);
  if (!found) throw new DemoNotFoundError(`Cliente ${id} não encontrado (not found)`);
  return found;
}

export function createOwner(data: Omit<Owner, "id" | "createdAt">): Owner {
  const created: Owner = {
    ...data,
    id: newId("owner"),
    createdAt: new Date().toISOString() as unknown as Date,
  };
  owners = [...owners, created];
  return created;
}

export function updateOwner(id: string, data: Partial<Owner>): Owner {
  const current = getOwner(id);
  const updated = { ...current, ...data, id: current.id };
  owners = owners.map((o) => (o.id === id ? updated : o));
  // Keep denormalized owner copies on pets/reservations in sync, same as a
  // real relational backend would on the next read.
  pets = pets.map((p) => (p.owner.id === id ? { ...p, owner: updated } : p));
  reservations = reservations.map((r) =>
    r.owner.id === id ? { ...r, owner: updated } : r,
  );
  return updated;
}

export function deleteOwner(id: string): void {
  getOwner(id);
  owners = owners.filter((o) => o.id !== id);
  const petIds = new Set(pets.filter((p) => p.owner.id === id).map((p) => p.id));
  pets = pets.filter((p) => p.owner.id !== id);
  reservations = reservations.filter((r) => !petIds.has(r.pet.id));
}

// ---- Pets --------------------------------------------------------------

export function listPets(): Pet[] {
  return pets;
}

export function getPet(id: string): Pet {
  const found = pets.find((p) => p.id === id);
  if (!found) throw new DemoNotFoundError(`Pet ${id} não encontrado (not found)`);
  return found;
}

export function listPetsByOwner(ownerId: string): Pet[] {
  return pets.filter((p) => p.owner.id === ownerId);
}

export function createPet(data: CreatePetData): Pet {
  const owner = getOwner(data.ownerId);
  const { ownerId: _ownerId, ...petFields } = data;
  const created: Pet = {
    ...petFields,
    id: newId("pet"),
    owner,
    createdAt: new Date().toISOString() as unknown as Date,
    notificationSettings: {
      feeding: true,
      medication: false,
      checkIn: true,
      checkOut: true,
    },
    baseDailyRate: 50,
    sizeMultiplier: { pequeno: 1, medio: 1.3, grande: 1.6 },
  };
  pets = [...pets, created];
  return created;
}

export function updatePet(id: string, data: Partial<Pet>): Pet {
  const current = getPet(id);
  const owner = data.owner ? getOwner((data.owner as Owner).id) : current.owner;
  const updated = { ...current, ...data, id: current.id, owner };
  pets = pets.map((p) => (p.id === id ? updated : p));
  reservations = reservations.map((r) =>
    r.pet.id === id ? { ...r, pet: updated } : r,
  );
  return updated;
}

export function deletePet(id: string): void {
  getPet(id);
  pets = pets.filter((p) => p.id !== id);
  reservations = reservations.filter((r) => r.pet.id !== id);
  stayHistory = stayHistory.filter((s) => s.petId !== id);
  vaccinationCards.delete(id);
}

// ---- Reservations --------------------------------------------------------

function overlaps(res: Reservation, date: Date): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const checkIn = new Date(res.checkIn);
  const checkOut = new Date(res.checkOut);
  return res.status !== "cancelled" && checkIn <= dayEnd && checkOut >= dayStart;
}

export function listReservations(date?: string): Reservation[] {
  if (!date) return reservations;
  const target = new Date(date);
  return reservations.filter((r) => overlaps(r, target));
}

export function getReservation(id: string): Reservation {
  const found = reservations.find((r) => r.id === id);
  if (!found) throw new DemoNotFoundError(`Reserva ${id} não encontrada (not found)`);
  return found;
}

export function listReservationsByPet(petId: string): Reservation[] {
  return reservations.filter((r) => r.pet.id === petId);
}

export function createReservation(data: CreateReservationData): Reservation {
  const petRef = getPet(data.petId);
  const owner = getOwner(data.ownerId);
  const created: Reservation = {
    id: newId("res"),
    pet: petRef,
    owner,
    checkIn: new Date(data.checkIn).toISOString(),
    checkOut: new Date(data.checkOut).toISOString(),
    status: data.status,
    notes: data.notes,
    dailyRate:
      data.dailyRate ??
      (petRef.size === "grande"
        ? settings.dailyRateLarge
        : settings.dailyRateStandard),
    discountPercentage: data.discountPercentage,
    createdAt: new Date().toISOString(),
  };
  reservations = [...reservations, created];
  return created;
}

export function updateReservation(
  id: string,
  data: Partial<Reservation>,
): Reservation {
  const current = getReservation(id);
  const updated = { ...current, ...data, id: current.id };
  reservations = reservations.map((r) => (r.id === id ? updated : r));
  return updated;
}

export function updateReservationStatus(
  id: string,
  status: string,
): Reservation {
  return updateReservation(id, { status: status as Reservation["status"] });
}

export function deleteReservation(id: string): void {
  getReservation(id);
  reservations = reservations.filter((r) => r.id !== id);
}

export function checkDayCapacity(date: string) {
  const target = new Date(date);
  const dayReservations = reservations.filter((r) => overlaps(r, target));
  const MAX_CAPACITY = 10;
  return {
    date,
    totalPets: dayReservations.length,
    isFull: dayReservations.length >= MAX_CAPACITY,
    reservations: dayReservations,
  };
}

// ---- Stay history --------------------------------------------------------

export function listStayHistory(): StayHistory[] {
  return stayHistory;
}

export function listStayHistoryByPet(petId: string): StayHistory[] {
  return stayHistory.filter((s) => s.petId === petId);
}

export function createStayHistory(data: Omit<StayHistory, "id">): StayHistory {
  const created: StayHistory = { ...data, id: newId("stay") };
  stayHistory = [...stayHistory, created];
  return created;
}

export function updateStayHistory(
  id: string,
  data: Partial<StayHistory>,
): StayHistory {
  const current = stayHistory.find((s) => s.id === id);
  if (!current) throw new DemoNotFoundError(`Histórico ${id} não encontrado (not found)`);
  const updated = { ...current, ...data, id: current.id };
  stayHistory = stayHistory.map((s) => (s.id === id ? updated : s));
  return updated;
}

// ---- Settings --------------------------------------------------------------

export function getSettings(): AppSettings {
  return settings;
}

export function updateSettings(data: Partial<AppSettings>): AppSettings {
  settings = { ...settings, ...data, updatedAt: new Date().toISOString() };
  return settings;
}

// ---- Vaccination cards -----------------------------------------------------

export function getVaccinationCard(petId: string): VaccinationCardResponse | null {
  return vaccinationCards.get(petId) ?? null;
}

export function setVaccinationCard(
  petId: string,
  file: Pick<File, "name" | "size" | "type">,
  dataUrl: string,
): VaccinationCardResponse {
  const record: VaccinationCardResponse = {
    id: newId("card"),
    url: dataUrl,
    fileId: newId("file"),
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    petId,
    fileSize: file.size,
    fileType: file.type,
  };
  vaccinationCards.set(petId, record);
  return record;
}

export function deleteVaccinationCard(petId: string): void {
  vaccinationCards.delete(petId);
}
