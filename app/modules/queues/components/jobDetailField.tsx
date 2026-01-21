import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface JobDetailFieldProps {
  label: string;
  value?: string | number | null;
  children?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export default function JobDetailField({
  label,
  value,
  children,
  className,
  valueClassName,
}: JobDetailFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-foreground text-sm font-medium">{label}</div>
      {children || (
        <div className={cn("text-muted-foreground text-sm", valueClassName)}>
          {value}
        </div>
      )}
    </div>
  );
}
