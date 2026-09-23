import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "inverse";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-green-dark text-brand-off-white hover:bg-brand-brown",

  secondary:
    "border border-brand-earth bg-transparent text-brand-green-dark hover:bg-brand-cream",

  ghost:
    "bg-transparent text-brand-green-dark hover:bg-brand-cream",

  inverse:
    "bg-brand-off-white text-brand-green-dark hover:bg-brand-cream",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-md",
        "font-heading font-semibold",
        "transition-colors duration-200",
        "focus-visible:outline-2",
        "focus-visible:outline-offset-3",
        "focus-visible:outline-brand-green-moss",
        "disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}