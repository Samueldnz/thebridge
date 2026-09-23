import type { LucideIcon, LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({
  icon: IconComponent,
  size = 20,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    />
  );
}