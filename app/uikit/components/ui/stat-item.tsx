import * as React from "react";

import { cn } from "@/lib/utils";

function StatItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export { StatItem };
