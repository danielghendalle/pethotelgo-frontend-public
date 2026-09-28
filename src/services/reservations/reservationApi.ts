import { httpClient, API_ENDPOINTS } from "../core";
import type {
  Reservation,
  CreateReservationData,
  DayCapacity,
} from "@/types/hotel";

class ReservationService {
  async getAll(date?: string): Promise<Reservation[]> {
    const query = date ? `?date=${date}` : "";
    return httpClient.get(`${API_ENDPOINTS.RESERVATIONS.BASE}${query}`);
  }

  async getById(id: string): Promise<Reservation> {
    return httpClient.get(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
  }

  async getByPet(petId: string): Promise<Reservation[]> {
    return httpClient.get(API_ENDPOINTS.RESERVATIONS.BY_PET(petId));
  }

  async create(data: CreateReservationData): Promise<Reservation> {
    return httpClient.post(API_ENDPOINTS.RESERVATIONS.BASE, data);
  }

  async update(id: string, data: Partial<Reservation>): Promise<Reservation> {
    return httpClient.put(API_ENDPOINTS.RESERVATIONS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
  }

  async updateStatus(id: string, status: string): Promise<Reservation> {
    return httpClient.patch(API_ENDPOINTS.RESERVATIONS.STATUS(id), {
      status,
    });
  }

  async checkDayCapacity(date: string): Promise<DayCapacity> {
    return httpClient.get(API_ENDPOINTS.RESERVATIONS.CAPACITY(date));
  }
}

export const reservationService = new ReservationService();

export const reservationAPI = {
  getAll: (date?: string) => reservationService.getAll(date),
  getById: (id: string) => reservationService.getById(id),
  getByPet: (petId: string) => reservationService.getByPet(petId),
  create: (data: CreateReservationData) => reservationService.create(data),
  update: (id: string, data: Partial<Reservation>) =>
    reservationService.update(id, data),
  delete: (id: string) => reservationService.delete(id),
  updateStatus: (id: string, status: string) =>
    reservationService.updateStatus(id, status),
  checkDayCapacity: (date: string) => reservationService.checkDayCapacity(date),
};
