import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("admin@trazabilidad.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        login(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user as any
        );
        navigate("/dashboard");
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Credenciales inválidas o servidor inalcanzable"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Logo */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-2xl">troubleshoot</span>
          </div>
          <div>
            <h1 className="font-headline-md text-xl font-bold text-primary tracking-tight">DevTrace</h1>
            <p className="text-xs text-on-surface-variant">Plataforma de Trazabilidad</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>v1.0.0 Enterprise</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-surface-container-lowest p-8 sm:p-10 rounded-2xl shadow-xl border border-outline-variant/30 relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Acceso al Sistema</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 text-xs font-medium flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-lg text-error">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Seed credentials hint */}
          <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
            <p className="text-[11px] text-on-surface-variant font-mono">
              Credenciales: <span className="font-bold text-primary">admin@trazabilidad.com</span> / <span className="font-bold text-primary">Admin123!</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-on-surface-variant/70">
        &copy; {new Date().getFullYear()} DevTrace Incidencias. Todos los derechos reservados.
      </footer>
    </div>
  );
};
