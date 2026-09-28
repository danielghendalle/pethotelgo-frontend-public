import {
  API_CONFIG,
  API_ENDPOINTS,
  AUTH_STORAGE_KEYS,
  IS_DEMO,
  clearSessionAndRedirect,
} from "../../core";
import {
  getVaccinationCard as demoGetCard,
  setVaccinationCard as demoSetCard,
  deleteVaccinationCard as demoDeleteCard,
} from "../../demo/demoStore";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

export interface VaccinationCardResponse {
  id: string;
  url: string;
  fileId: string;
  fileName: string;
  uploadedAt: string;
  petId: string;
  fileSize?: number;
  fileType?: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

class VaccinationCardService {
  private async getAuthToken(): Promise<string | null> {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  async upload(
    petId: string,
    file: File,
    onProgress?: (event: UploadProgressEvent) => void,
  ): Promise<VaccinationCardResponse> {
    if (IS_DEMO) {
      onProgress?.({ loaded: file.size, total: file.size, percentage: 50 });
      const dataUrl = await readFileAsDataUrl(file);
      await new Promise((resolve) => setTimeout(resolve, 300));
      onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });
      return demoSetCard(petId, file, dataUrl);
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = await this.getAuthToken();

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const loaded = event.loaded;
          const total = event.total;
          const percentage = Math.round((loaded / total) * 100);

          onProgress({
            loaded,
            total,
            percentage,
          });
        }
      });
    }

    return new Promise((resolve, reject) => {
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(
              xhr.responseText,
            ) as VaccinationCardResponse;
            resolve(response);
          } catch {
            reject(new Error("Erro ao processar resposta do servidor"));
          }
        } else if (xhr.status === 401 || xhr.status === 403) {
          clearSessionAndRedirect();
          reject(
            new Error("Sessão expirada. Por favor, faça login novamente."),
          );
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorData.message || `Erro no upload: ${xhr.statusText}`,
              ),
            );
          } catch {
            reject(new Error(`Erro no upload: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Erro de conexão ao fazer upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelado"));
      });

      xhr.open(
        "POST",
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PETS.VACCINATION_CARD(petId)}/upload`,
        true,
      );

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  async get(petId: string): Promise<VaccinationCardResponse | null> {
    if (IS_DEMO) return demoGetCard(petId);

    try {
      const token = await this.getAuthToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PETS.VACCINATION_CARD(petId)}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (response.status === 404 || response.status === 204) {
        return null;
      }

      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect();
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar cartão: ${response.statusText}`);
      }

      const data = await response.json();
      return data as VaccinationCardResponse;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Erro desconhecido";
      throw new Error(`Falha ao buscar cartão de vacina: ${errorMsg}`);
    }
  }

  async delete(petId: string): Promise<void> {
    if (IS_DEMO) return demoDeleteCard(petId);

    try {
      const token = await this.getAuthToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PETS.VACCINATION_CARD(petId)}`,
        {
          method: "DELETE",
          headers,
        },
      );

      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect();
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      if (!response.ok) {
        throw new Error(`Erro ao deletar cartão: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(
        `Falha ao deletar cartão de vacina: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    }
  }
}

export const vaccinationCardService = new VaccinationCardService();

export const vaccinationCardAPI = {
  upload: (
    petId: string,
    file: File,
    onProgress?: (event: UploadProgressEvent) => void,
  ) => vaccinationCardService.upload(petId, file, onProgress),
  get: (petId: string) => vaccinationCardService.get(petId),
  delete: (petId: string) => vaccinationCardService.delete(petId),
};
