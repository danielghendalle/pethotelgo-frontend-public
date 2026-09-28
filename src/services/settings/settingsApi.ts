import { httpClient, API_ENDPOINTS } from "../core";
import type { AppSettings, UpdateSettingsData } from "@/types/hotel";

class SettingsService {
  async get(): Promise<AppSettings> {
    return httpClient.get(API_ENDPOINTS.SETTINGS.BASE);
  }

  async update(data: UpdateSettingsData): Promise<AppSettings> {
    return httpClient.put(API_ENDPOINTS.SETTINGS.BASE, data);
  }
}

export const settingsService = new SettingsService();

export const settingsAPI = {
  get: () => settingsService.get(),
  update: (data: UpdateSettingsData) => settingsService.update(data),
};
