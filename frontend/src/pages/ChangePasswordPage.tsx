import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

export const ChangePasswordPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isForced = user?.mustChangePwd ?? false;

  // Criterios de validación de seguridad
  const rules = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(newPassword),
      notSameAsCurrent: newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword,
      matchesConfirm: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, currentPassword, confirmPassword]);

  // Cálculo de fortaleza (0 a 100%)
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, text: "Sin contraseña", color: "bg-outline-variant", textColor: "text-on-surface-variant" };
    let points = 0;
    if (rules.minLength) points += 20;
    if (newPassword.length >= 12) points += 10;
    if (rules.hasUpper) points += 20;
    if (rules.hasLower) points += 15;
    if (rules.hasNumber) points += 15;
    if (rules.hasSpecial) points += 20;

    if (points < 40) return { score: points, text: "Muy Débil", color: "bg-error", textColor: "text-error" };
    if (points < 65) return { score: points, text: "Media", color: "bg-amber-500", textColor: "text-amber-600" };
    if (points < 85) return { score: points, text: "Fuerte", color: "bg-blue-600", textColor: "text-blue-600" };
    return { score: points, text: "Excelente", color: "bg-emerald-600", textColor: "text-emerald-600" };
  }, [newPassword, rules]);

  const canSubmit =
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial &&
    rules.matchesConfirm &&
    currentPassword.length > 0 &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación de la contraseña no coincide.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("La nueva contraseña no puede ser idéntica a la contraseña actual.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMessage("¡Tu contraseña ha sido actualizada exitosamente!");
        await refreshUser();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrorMessage(res.message || "No se pudo actualizar la contraseña.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || "Error al cambiar la contraseña.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Cambio de Contraseña</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Administra tus credenciales de acceso y mantén segura tu cuenta institucional
          </p>
        </div>

        {isForced && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <span className="material-symbols-outlined text-base animate-pulse">warning</span>
            <span>Acción Obligatoria</span>
          </div>
        )}
      </div>

      {/* Alerta de cambio obligatorio */}
      {isForced && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-xs text-on-surface flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 flex-shrink-0">
            <span className="material-symbols-outlined text-xl">security</span>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">
              Actualización de Clave Requerida
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Tu cuenta tiene una contraseña provisional o tu administrador ha solicitado un cambio de clave obligatorio.
              Por políticas de seguridad, debes establecer una nueva clave segura para desbloquear todas las funciones del sistema.
            </p>
          </div>
        </div>
      )}

      {/* Mensajes de error y éxito */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 text-xs font-medium flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-lg text-error">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            <span>{successMessage} Redirigiendo al panel principal...</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            Ir ahora
          </button>
        </div>
      )}

      {/* Layout Grid: Formulario + Guía de Políticas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-xs relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Contraseña Actual *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                  key
                </span>
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showCurrent ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-outline-variant/20 pt-2"></div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                  lock
                </span>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showNew ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Barra de fortaleza */}
              {newPassword && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Fortaleza:</span>
                    <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                  verified_user
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className={`w-full pl-10 pr-11 py-2.5 bg-surface-container-low border rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    confirmPassword && !rules.matchesConfirm
                      ? "border-error focus:ring-error"
                      : confirmPassword && rules.matchesConfirm
                      ? "border-emerald-500 focus:ring-emerald-500"
                      : "border-outline-variant/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirm ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {confirmPassword && !rules.matchesConfirm && (
                <p className="text-[11px] text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">close</span>
                  Las contraseñas no coinciden.
                </p>
              )}
              {confirmPassword && rules.matchesConfirm && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Las contraseñas coinciden correctamente.
                </p>
              )}
            </div>

            {/* Botón de acción */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3 px-6 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Actualizando Contraseña...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Guardar Nueva Contraseña</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panel lateral: Requisitos de Seguridad */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-xl">shield</span>
            <h3 className="text-sm font-bold text-on-surface">Requisitos de Seguridad</h3>
          </div>

          <p className="text-xs text-on-surface-variant">
            Para proteger tu información, tu nueva contraseña debe cumplir con los siguientes estándares de complejidad institucional:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.minLength ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.minLength ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.minLength ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Mínimo 8 caracteres
              </span>
            </li>

            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.hasUpper ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.hasUpper ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.hasUpper ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Al menos una letra mayúscula (A-Z)
              </span>
            </li>

            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.hasLower ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.hasLower ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.hasLower ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Al menos una letra minúscula (a-z)
              </span>
            </li>

            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.hasNumber ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.hasNumber ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.hasNumber ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Al menos un número (0-9)
              </span>
            </li>

            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.hasSpecial ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.hasSpecial ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.hasSpecial ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Al menos un símbolo o carácter especial (!@#$%^&*...)
              </span>
            </li>

            <li className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-base transition-colors ${
                  rules.notSameAsCurrent ? "text-emerald-500" : "text-on-surface-variant/40"
                }`}
              >
                {rules.notSameAsCurrent ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={rules.notSameAsCurrent ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                Diferente a la contraseña actual
              </span>
            </li>
          </ul>

          {/* Tips de seguridad */}
          <div className="pt-3 border-t border-outline-variant/20">
            <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-on-surface-variant space-y-1">
              <p className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Recomendación de Seguridad
              </p>
              <p>
                No utilices palabras comunes, secuencias sencillas (como 123456) ni datos personales como tu fecha de nacimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
