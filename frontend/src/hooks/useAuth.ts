"use client";

import { useState, useEffect, useCallback } from "react";
import { login as loginApi, logout as logoutApi, getUser, getToken } from "@/lib/auth";
import type { User, LoginRequest } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(credentials);
      setUser(res.user);
      return res;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    logoutApi();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!getToken(),
  };
}
