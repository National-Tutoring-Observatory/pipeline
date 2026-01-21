import * as React from "react";

import { cn } from "@/lib/utils";

export interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}

function Pre({ className, children, ...props }: PreProps) {
  return (
    <div className="border rounded bg-muted max-h-32 overflow-auto">
      <pre
        className={cn(
          "text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

export { Pre };
