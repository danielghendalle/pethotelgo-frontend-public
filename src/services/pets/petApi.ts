import { httpClient, API_ENDPOINTS } from "../core";
import type {
  Pet,
  Reservation,
  StayHistory,
  CreatePetData,
} from "@/types/hotel";

class PetService {
  async getAll(): Promise<Pet[]> {
    return httpClient.get(API_ENDPOINTS.PETS.BASE);
  }

  async getById(id: string): Promise<Pet> {
    return httpClient.get(API_ENDPOINTS.PETS.BY_ID(id));
  }

  async getByOwner(ownerId: string): Promise<Pet[]> {
    return httpClient.get(API_ENDPOINTS.PETS.BY_OWNER(ownerId));
  }

  async getReservations(petId: string): Promise<Reservation[]> {
    return httpClient.get(API_ENDPOINTS.PETS.RESERVATIONS(petId));
  }

  async getStayHistory(petId: string): Promise<StayHistory[]> {
    return httpClient.get(API_ENDPOINTS.PETS.STAY_HISTORY(petId));
  }

  async create(data: CreatePetData): Promise<Pet> {
    return httpClient.post(API_ENDPOINTS.PETS.BASE, data);
  }

  async update(id: string, data: Partial<Pet>): Promise<Pet> {
    return httpClient.put(API_ENDPOINTS.PETS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.PETS.BY_ID(id);
    console.debug(`[PetAPI] DELETE request to: ${endpoint}, ID: ${id}`);
    return httpClient.delete(endpoint);
  }
}

export const petService = new PetService();

export const petAPI = {
  getAll: () => petService.getAll(),
  getById: (id: string) => petService.getById(id),
  getByOwner: (ownerId: string) => petService.getByOwner(ownerId),
  getReservations: (petId: string) => petService.getReservations(petId),
  getStayHistory: (petId: string) => petService.getStayHistory(petId),
  create: (data: CreatePetData) => petService.create(data),
  update: (id: string, data: Partial<Pet>) => petService.update(id, data),
  delete: (id: string) => petService.delete(id),
};
