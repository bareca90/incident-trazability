import axios from "axios";
import { ApiResponse, LoginResponse, User, Incident, SolutionStep, StepAttachment, Role, Menu, MenuOption, AuditLog, System } from "../types";

const API_BASE_URL = "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores de respuesta y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          if (res.data.success) {
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints de AutenticaciÃ³n
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", { email, password });
    return res.data;
  },
  me: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.clear();
    }
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/change-password", { currentPassword, newPassword });
    return res.data;
  },
};

// Endpoints de Incidencias
export const incidentService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<Incident[]>>("/incidents", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return res.data;
  },
  create: async (data: Partial<Incident>) => {
    const res = await api.post<ApiResponse<Incident>>("/incidents", data);
    return res.data;
  },
  update: async (id: string, data: Partial<Incident>) => {
    const res = await api.put<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/incidents/${id}`);
    return res.data;
  },
};

// Endpoints de Pasos de SoluciÃ³n y Adjuntos
export const solutionStepService = {
  getByIncident: async (incidentId: string) => {
    const res = await api.get<ApiResponse<SolutionStep[]>>(`/incidents/${incidentId}/steps`);
    return res.data;
  },
  create: async (incidentId: string, steps: Partial<SolutionStep> | Partial<SolutionStep>[]) => {
    const res = await api.post<ApiResponse<SolutionStep | SolutionStep[]>>(`/incidents/${incidentId}/steps`, steps);
    return res.data;
  },
  update: async (id: string, step: Partial<SolutionStep>) => {
    const res = await api.put<ApiResponse<SolutionStep>>(`/solution-steps/${id}`, step);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/solution-steps/${id}`);
    return res.data;
  },
  uploadAttachment: async (stepId: string, file: File, descripcion?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (descripcion) formData.append("descripcion", descripcion);
    const res = await api.post<ApiResponse<StepAttachment>>(`/solution-steps/${stepId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteAttachment: async (attachmentId: string) => {
    const res = await api.delete(`/solution-steps/attachments/${attachmentId}`);
    return res.data;
  },
};

// Endpoints de Usuarios
export const userService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<User[]>>("/users", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },
  create: async (data: Partial<User> & { password: string }) => {
    const res = await api.post<ApiResponse<User>>("/users", data);
    return res.data;
  },
  update: async (id: string, data: Partial<User>) => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
  resetPassword: async (id: string, newPassword: string, mustChangePwd: boolean = true) => {
    const res = await api.post<ApiResponse<null>>(`/users/${id}/reset-password`, { newPassword, mustChangePwd });
    return res.data;
  },
  forcePasswordChange: async (id: string, mustChange: boolean = true) => {
    const res = await api.post<ApiResponse<null>>(`/users/${id}/force-password-change`, { mustChange });
    return res.data;
  },
  unlock: async (id: string) => {
    const res = await api.post<ApiResponse<null>>(`/users/${id}/unlock`);
    return res.data;
  },
  getPasswordLogs: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<AuditLog[]>>("/users/password-logs", { params });
    return res.data;
  },
};


// Endpoints de Roles y Permisos
export const roleService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Role[]>>("/roles");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return res.data;
  },
  create: async (data: Partial<Role>) => {
    const res = await api.post<ApiResponse<Role>>("/roles", data);
    return res.data;
  },
  update: async (id: number, data: Partial<Role>) => {
    const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },
  getPermissions: async (roleId: number) => {
    const res = await api.get<ApiResponse<any[]>>(`/roles/${roleId}/permissions`);
    return res.data;
  },
  setPermissions: async (roleId: number, permissions: { menuOptionId: number; acceso: string; permitido: boolean }[]) => {
    const res = await api.put<ApiResponse<null>>(`/roles/${roleId}/permissions`, permissions);
    return res.data;
  },
  getUserRoles: async (userId: string) => {
    const res = await api.get<ApiResponse<Role[]>>(`/roles/users/${userId}`);
    return res.data;
  },
  assignRole: async (userId: string, roleId: number, vigenciaHasta?: string) => {
    const res = await api.post<ApiResponse<null>>(`/roles/users/${userId}`, { roleId, vigenciaHasta });
    return res.data;
  },
  removeRole: async (userId: string, roleId: number) => {
    const res = await api.delete(`/roles/users/${userId}/${roleId}`);
    return res.data;
  },
};

// Endpoints de Menús
export const menuService = {
  getAllMenus: async () => {
    const res = await api.get<ApiResponse<Menu[]>>("/menus");
    return res.data;
  },
  createMenu: async (data: Partial<Menu>) => {
    const res = await api.post<ApiResponse<Menu>>("/menus", data);
    return res.data;
  },
  updateMenu: async (id: number, data: Partial<Menu>) => {
    const res = await api.put<ApiResponse<Menu>>(`/menus/${id}`, data);
    return res.data;
  },
  deleteMenu: async (id: number) => {
    const res = await api.delete(`/menus/${id}`);
    return res.data;
  },
  getAllOptions: async () => {
    const res = await api.get<ApiResponse<MenuOption[]>>("/menus/options/all");
    return res.data;
  },
  getMenuOptions: async (menuId: number) => {
    const res = await api.get<ApiResponse<MenuOption[]>>(`/menus/${menuId}/options`);
    return res.data;
  },
  createOption: async (data: Partial<MenuOption>) => {
    const res = await api.post<ApiResponse<MenuOption>>("/menus/options", data);
    return res.data;
  },
  updateOption: async (id: number, data: Partial<MenuOption>) => {
    const res = await api.put<ApiResponse<MenuOption>>(`/menus/options/${id}`, data);
    return res.data;
  },
  deleteOption: async (id: number) => {
    const res = await api.delete(`/menus/options/${id}`);
    return res.data;
  },
  getMyMenus: async () => {
    const res = await api.get<ApiResponse<Menu[]>>("/menus/my-menus");
    return res.data;
  },
  getMyPermissions: async () => {
    const res = await api.get<ApiResponse<any[]>>("/menus/my-permissions");
    return res.data;
  },
};

// Endpoints de Sistemas Afectados
export const systemService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<System[]>>("/sistemas");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<System>>(`/sistemas/${id}`);
    return res.data;
  },
  create: async (data: Partial<System>) => {
    const res = await api.post<ApiResponse<System>>("/sistemas", data);
    return res.data;
  },
  update: async (id: number, data: Partial<System>) => {
    const res = await api.put<ApiResponse<System>>(`/sistemas/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/sistemas/${id}`);
    return res.data;
  },
};

// Endpoints de Auditoría
export const auditLogService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get<ApiResponse<AuditLog[]>>("/audit-logs", { params });
    return res.data;
  },
};
