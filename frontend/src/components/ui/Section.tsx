import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg" | "xl";
  surface?: "primary" | "secondary" | "inverse" | "white";
}

const spacingClasses = {
  sm: "py-16",
  md: "py-24",
  lg: "py-32",
  xl: "py-40",
};

const surfaceClasses = {
  primary: "bg-surface-primary",
  secondary: "bg-surface-secondary",
  inverse: "bg-surface-inverse text-text-inverse",
  white: "bg-surface-white",
};

export function Section({
  children,
  spacing = "lg",
  surface = "primary",
  className = "",
  ...props
}: SectionProps) {
  return (
    <section
      className={[
        spacingClasses[spacing],
        surfaceClasses[surface],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}