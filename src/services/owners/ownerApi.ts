import { httpClient, API_ENDPOINTS } from "../core";
import type { Owner } from "@/types/hotel";

class OwnerService {
  async getAll(): Promise<Owner[]> {
    return httpClient.get(API_ENDPOINTS.OWNERS.BASE);
  }

  async getById(id: string): Promise<Owner> {
    return httpClient.get(API_ENDPOINTS.OWNERS.BY_ID(id));
  }

  async create(data: Omit<Owner, "id" | "createdAt">): Promise<Owner> {
    return httpClient.post(API_ENDPOINTS.OWNERS.BASE, data);
  }

  async update(id: string, data: Partial<Owner>): Promise<Owner> {
    return httpClient.put(API_ENDPOINTS.OWNERS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(API_ENDPOINTS.OWNERS.BY_ID(id));
  }
}

export const ownerService = new OwnerService();

export const ownerAPI = {
  getAll: () => ownerService.getAll(),
  getById: (id: string) => ownerService.getById(id),
  create: (data: Omit<Owner, "id" | "createdAt">) => ownerService.create(data),
  update: (id: string, data: Partial<Owner>) => ownerService.update(id, data),
  delete: (id: string) => ownerService.delete(id),
};
