import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  LoginCredentials,
  RegisterCredentials,
  authAPI,
} from "@/services";
import { AUTH_STORAGE_KEYS } from "@/services/core";
import { clearApiCache } from "@/utils/pwa";
import { AuthContext } from "./contexts";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export type { AuthContextType };

const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
};

const saveSession = (userData: User, token: string, refreshToken: string) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(userData));
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Confirms the stored session is still accepted by the backend. This
  // reuses httpClient's own refresh-then-retry logic: a still-valid or
  // silently-renewable token succeeds here with no visible effect, while a
  // session the backend no longer honors (expired refresh token, revoked on
  // another device, etc.) makes httpClient itself clear storage and hard
  // -navigate to /auth. That hard navigation is what re-fetches a fresh
  // index.html/bundle, which is what actually clears the "stuck on a stale
  // build" blank-screen case reported on mobile after the app sat
  // backgrounded for a while.
  const revalidateSession = useCallback(() => {
    if (!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)) return;

    authAPI
      .getCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(freshUser));
      })
      .catch(() => {
        // A hard auth failure is already handled by httpClient (storage
        // cleared + redirected to /auth). Anything else (e.g. offline) is
        // left alone so a flaky connection doesn't log the user out.
      });
  }, []);

  // Load user from localStorage on mount, then confirm with the backend.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("AuthProvider: Failed to restore user from storage", error);
      clearSession();
    } finally {
      setIsLoading(false);
    }

    revalidateSession();
  }, [revalidateSession]);

  // Re-check the session whenever the app regains focus: covers switching
  // back to the tab, and — on mobile home-screen installs — the OS resuming
  // a previously backgrounded/suspended instance (pageshow persisted=true).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") revalidateSession();
    };
    const onPageShow = () => revalidateSession();

    document.addEventListener("visibilitychange", onVisible);
    globalThis.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      globalThis.removeEventListener("pageshow", onPageShow);
    };
  }, [revalidateSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.user);
    saveSession(response.user, response.token, response.refreshToken);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await authAPI.register(credentials);
    setUser(response.user);
    saveSession(response.user, response.token, response.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      clearSession();
      void clearApiCache();
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
