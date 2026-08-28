import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Menu, TipoAcceso } from "../types";
import { authService, menuService } from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userMenus: Menu[];
  hasPermission: (optionCode: string, access?: TipoAcceso) => boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [userMenus, setUserMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserMenus = useCallback(async () => {
    try {
      const res = await menuService.getMyMenus();
      if (res.success) {
        setUserMenus(res.data);
      }
    } catch {
      setUserMenus([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      if (res.success) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        await fetchUserMenus();
      }
    } catch (err) {
      console.error("Error al refrescar usuario", err);
    }
  }, [fetchUserMenus]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await authService.me();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            await fetchUserMenus();
          }
        } catch {
          localStorage.clear();
          setUser(null);
          setUserMenus([]);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUserMenus]);

  const hasPermission = useCallback((optionCode: string, access: TipoAcceso = "ver"): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.roles?.some((r) => r.esAdmin)) return true;
    if (!user.permissions) return false;
    return user.permissions.some(
      (p) => p.codigoOpcion === optionCode && p.acceso === access && p.permitido
    );
  }, [user]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    fetchUserMenus();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setUserMenus([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        userMenus,
        hasPermission,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
