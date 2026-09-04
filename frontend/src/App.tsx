import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { RolesPage } from "./pages/RolesPage";
import { MenusPage } from "./pages/MenusPage";
import { SystemsPage } from "./pages/SystemsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { PasswordManagementPage } from "./pages/PasswordManagementPage";
import { TipoAcceso } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredOption?: string;
  requiredAccess?: TipoAcceso;
  allowMustChange?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredOption,
  requiredAccess = "ver",
  allowMustChange = false,
}) => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario debe cambiar clave obligatoriamente y no está en la ruta de cambio, forzar navegación
  if (user?.mustChangePwd && !allowMustChange && location.pathname !== "/cambio-clave") {
    return <Navigate to="/cambio-clave" replace />;
  }

  if (requiredOption && !hasPermission(requiredOption, requiredAccess)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};


export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidencias"
        element={
          <ProtectedRoute requiredOption="INC_LISTA" requiredAccess="ver">
            <IncidentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidencias/:id"
        element={
          <ProtectedRoute requiredOption="INC_DETALLE" requiredAccess="ver">
            <IncidentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute requiredOption="USR_LISTA" requiredAccess="ver">
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute requiredOption="SEG_ROLES" requiredAccess="ver">
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menus"
        element={
          <ProtectedRoute requiredOption="CONF_MENUS" requiredAccess="ver">
            <MenusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sistemas"
        element={
          <ProtectedRoute requiredOption="CONF_SISTEMAS" requiredAccess="ver">
            <SystemsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute requiredOption="SEG_BITACORA" requiredAccess="ver">
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cambio-clave"
        element={
          <ProtectedRoute allowMustChange>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seguridad/claves"
        element={
          <ProtectedRoute requiredOption="USR_LISTA" requiredAccess="ver">
            <PasswordManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
