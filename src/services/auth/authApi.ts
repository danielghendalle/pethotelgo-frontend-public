import { httpClient, API_ENDPOINTS } from "../core";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: UserInfo;
  token: string;
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  tokenType: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return httpClient.post(API_ENDPOINTS.AUTH.REGISTER, credentials);
  }

  async logout(): Promise<void> {
    await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return httpClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  }

  async getCurrentUser(): Promise<UserInfo> {
    return httpClient.get(API_ENDPOINTS.AUTH.ME);
  }
}

export const authService = new AuthService();

export const authAPI = {
  login: (credentials: LoginCredentials) => authService.login(credentials),
  register: (credentials: RegisterCredentials) =>
    authService.register(credentials),
  logout: () => authService.logout(),
  refreshToken: (refreshToken: string) =>
    authService.refreshToken(refreshToken),
  getCurrentUser: () => authService.getCurrentUser(),
};
