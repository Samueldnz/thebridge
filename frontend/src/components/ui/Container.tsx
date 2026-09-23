import type { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "narrow";
}

const sizeClasses = {
  default: "max-w-[var(--layout-content)]",
  wide: "max-w-[var(--layout-content-wide)]",
  narrow: "max-w-[var(--layout-content-narrow)]",
};

export function Container({
  children,
  size = "default",
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full",
        "px-5 md:px-8 lg:px-16",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}