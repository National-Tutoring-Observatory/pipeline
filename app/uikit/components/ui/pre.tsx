import * as React from "react";

import { cn } from "@/lib/utils";

export interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}

function Pre({ className, children, ...props }: PreProps) {
  return (
    <div className="bg-muted max-h-32 overflow-auto rounded border">
      <pre
        className={cn(
          "text-muted-foreground p-3 text-xs break-words whitespace-pre-wrap",
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
