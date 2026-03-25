import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface UserType {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: string;
  loyaltyPoints: number;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (u: Partial<UserType>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["auth_token", "auth_user"]).then(([tokenPair, userPair]) => {
      const savedToken = tokenPair[1];
      const savedUser = userPair[1];
      if (savedToken) {
        setToken(savedToken);
        setAuthTokenGetter(() => savedToken);
      }
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (phone: string, name?: string) => {
    const base = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    const response = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name: name ?? "Guest" }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    const { token: newToken, user: newUser } = data;

    setToken(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
    await AsyncStorage.multiSet([
      ["auth_token", newToken],
      ["auth_user", JSON.stringify(newUser)],
    ]);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setAuthTokenGetter(() => null);
    await AsyncStorage.multiRemove(["auth_token", "auth_user"]);
  }, []);

  const updateUser = useCallback((updates: Partial<UserType>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
