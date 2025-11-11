import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";
import type { User } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatar: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      loadUser(savedToken).catch((error) => {
        console.error("Failed to load user:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      const userData = await api.getProfile(authToken);
      setUser(userData);
    } catch (error) {
      console.error("Ошибка загрузки пользователя:", error);
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.access_token);
    localStorage.setItem("token", response.access_token);
    await loadUser(response.access_token);
  };

  const register = async (email: string, password: string) => {
    const response = await api.register(email, password);
    setToken(response.access_token);
    localStorage.setItem("token", response.access_token);
    await loadUser(response.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateAvatar = async (avatar: string) => {
    if (!token) return;
    const updatedUser = await api.updateAvatar(token, avatar);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, updateAvatar, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
