export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

// Public showcase build (GitHub Pages): no real backend to talk to, so every
// request is served by an in-memory fake API with seeded fictional data
// instead of `fetch`. See src/services/demo/.
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === "true";

export const AUTH_STORAGE_KEYS = {
  USER: "petHotelUser",
  TOKEN: "petHotelToken",
  REFRESH_TOKEN: "petHotelRefreshToken",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  OWNERS: {
    BASE: "/owners",
    BY_ID: (id: string) => `/owners/${id}`,
    PETS: (id: string) => `/owners/${id}/pets`,
  },
  PETS: {
    BASE: "/pets",
    BY_ID: (id: string) => `/pets/${id}`,
    BY_OWNER: (ownerId: string) => `/pets/owner/${ownerId}`,
    RESERVATIONS: (petId: string) => `/pets/${petId}/reservations`,
    STAY_HISTORY: (petId: string) => `/pets/${petId}/stay-history`,
    VACCINATION_CARD: (petId: string) => `/pets/${petId}/vaccination-card`,
  },
  RESERVATIONS: {
    BASE: "/reservations",
    BY_ID: (id: string) => `/reservations/${id}`,
    BY_PET: (petId: string) => `/reservations/pet/${petId}`,
    STATUS: (id: string) => `/reservations/${id}/status`,
    CAPACITY: (date: string) => `/reservations/capacity/${date}`,
  },
  STAY_HISTORY: {
    BASE: "/stay-history",
    BY_PET: (petId: string) => `/stay-history/pet/${petId}`,
  },
  SETTINGS: {
    BASE: "/settings",
  },
} as const;
