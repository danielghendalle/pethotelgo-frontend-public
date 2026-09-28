import { httpClient, API_ENDPOINTS } from "../core";
import type { StayHistory } from "@/types/hotel";

class StayHistoryService {
  async getAll(): Promise<StayHistory[]> {
    return httpClient.get(API_ENDPOINTS.STAY_HISTORY.BASE);
  }

  async getByPet(petId: string): Promise<StayHistory[]> {
    return httpClient.get(API_ENDPOINTS.STAY_HISTORY.BY_PET(petId));
  }

  async create(data: Omit<StayHistory, "id">): Promise<StayHistory> {
    return httpClient.post(API_ENDPOINTS.STAY_HISTORY.BASE, data);
  }

  async update(id: string, data: Partial<StayHistory>): Promise<StayHistory> {
    return httpClient.put(`${API_ENDPOINTS.STAY_HISTORY.BASE}/${id}`, data);
  }
}

export const stayHistoryService = new StayHistoryService();

export const stayHistoryAPI = {
  getAll: () => stayHistoryService.getAll(),
  getByPet: (petId: string) => stayHistoryService.getByPet(petId),
  create: (data: Omit<StayHistory, "id">) => stayHistoryService.create(data),
  update: (id: string, data: Partial<StayHistory>) =>
    stayHistoryService.update(id, data),
};
