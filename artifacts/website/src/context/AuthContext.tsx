import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthed: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("user_token"));
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("user_data") ?? "null"); } catch { return null; }
  });

  const login = useCallback((t: string, u: User) => {
    localStorage.setItem("user_token", t);
    localStorage.setItem("user_data", JSON.stringify(u));
    setToken(t); setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setToken(null); setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
