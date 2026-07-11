import apiClient from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "./types";

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials
  );
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function register(
  payload: RegisterRequest
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/auth/register",
    payload
  );
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
