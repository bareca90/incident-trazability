import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
  children: React.ReactNode;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children, size = "md" }) => {
  const styles = {
    primary:   "bg-primary-container text-on-primary-container border-primary-container/40",
    secondary: "bg-secondary-container text-on-secondary-container border-secondary-container/40",
    success:   "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning:   "bg-amber-100 text-amber-900 border-amber-300",
    danger:    "bg-error-container text-on-error-container border-error/20",
    info:      "bg-sky-100 text-sky-900 border-sky-300",
    neutral:   "bg-surface-container-high text-on-surface-variant border-outline-variant/40",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${styles[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
