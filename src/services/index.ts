export {
  httpClient,
  API_CONFIG,
  AUTH_STORAGE_KEYS,
  API_ENDPOINTS,
  ApiError,
} from "./core";
export type { ApiResponse, RequestConfig, PaginationParams } from "./core";

export { authAPI, authService } from "./auth";
export type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UserInfo,
} from "./auth";

export { ownerAPI, ownerService } from "./owners";

export {
  petAPI,
  petService,
  vaccinationCardAPI,
  vaccinationCardService,
} from "./pets";
export type { VaccinationCardResponse, UploadProgressEvent } from "./pets";

export { reservationAPI, reservationService } from "./reservations";

export { stayHistoryAPI, stayHistoryService } from "./stayHistory";

export { settingsAPI, settingsService } from "./settings";
