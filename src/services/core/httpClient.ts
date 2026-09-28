import { API_CONFIG, API_ENDPOINTS, AUTH_STORAGE_KEYS, IS_DEMO } from "./config";
import { clearSessionAndRedirect } from "./session";
import { ApiError, type RequestConfig } from "./types";
import { demoRequest } from "../demo/demoRouter";

// Endpoints that must never trigger a refresh-and-retry cycle: refresh
// itself would recurse, and login/register are called while unauthenticated.
const NO_REFRESH_ENDPOINTS: string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
];

class HttpClient {
  private readonly baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    return storedToken || null;
  }

  private async handleUnauthorized(): Promise<void> {
    clearSessionAndRedirect();
  }

  // Coalesces concurrent 401s into a single /auth/refresh call so a burst of
  // parallel requests doesn't burn through refresh-token rotations.
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = fetch(
        this.buildUrl(API_ENDPOINTS.AUTH.REFRESH),
        {
          method: "POST",
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ refreshToken }),
        },
      )
        .then(async (response) => {
          if (!response.ok) return null;
          const data = await response.json();
          localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
          localStorage.setItem(
            AUTH_STORAGE_KEYS.REFRESH_TOKEN,
            data.refreshToken,
          );
          return data.token as string;
        })
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private buildHeaders(options: RequestConfig): HeadersInit {
    return {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    };
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint}`;
  }

  private async handleErrorResponse(response: Response): Promise<void> {
    const statusCode = response.status;

    if (statusCode === 401 || statusCode === 403) {
      await this.handleUnauthorized();
      throw new ApiError(
        statusCode,
        "Sessão expirada. Por favor, faça login novamente.",
      );
    }

    let errorMessage = `HTTP Error: ${statusCode}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(statusCode, errorMessage);
  }

  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    const config: RequestConfig = { method: "GET", ...options };
    return this.request<T>(endpoint, config);
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig,
  ): Promise<T> {
    const config: RequestConfig = {
      method: "POST",
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    };
    return this.request<T>(endpoint, config);
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig,
  ): Promise<T> {
    const config: RequestConfig = {
      method: "PUT",
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    };
    return this.request<T>(endpoint, config);
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig,
  ): Promise<T> {
    const config: RequestConfig = {
      method: "PATCH",
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    };
    return this.request<T>(endpoint, config);
  }

  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    const config: RequestConfig = { method: "DELETE", ...options };
    return this.request<T>(endpoint, config);
  }

  async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    if (IS_DEMO) {
      const method = options.method || "GET";
      const body =
        typeof options.body === "string" ? JSON.parse(options.body) : undefined;
      return demoRequest<T>(method, endpoint, body);
    }
    return this.executeRequest<T>(endpoint, options, true);
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestConfig,
    allowRefresh: boolean,
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const token = await this.getAuthToken();

    const headers = this.buildHeaders(options);
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const method = options.method || "GET";
      console.debug(`[HttpClient] ${method} ${url}`);

      const response = await fetch(url, config);

      if (
        response.status === 401 &&
        allowRefresh &&
        !NO_REFRESH_ENDPOINTS.includes(endpoint)
      ) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.executeRequest<T>(endpoint, options, false);
        }
      }

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (response.status === 204 || response.status === 205) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return undefined as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, "Erro de conexão com o servidor", error as Error);
    }
  }
}

export const httpClient = new HttpClient();
