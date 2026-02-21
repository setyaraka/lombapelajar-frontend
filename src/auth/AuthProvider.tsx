import { useEffect, useState } from "react";
import api from "../api/axios";
import type { User, LoginResponse, MeResponse } from "../api/types";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get<MeResponse>("/auth/me");
        if (mounted) setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<LoginResponse>("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};
