import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-between gap-4 pb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type PageHeaderLeftProps = {
  children: React.ReactNode;
  className?: string;
};

function PageHeaderLeft({ children, className }: PageHeaderLeftProps) {
  return (
    <div className={cn("flex min-h-10 items-center gap-2", className)}>
      {children}
    </div>
  );
}

export type PageHeaderRightProps = {
  children: React.ReactNode;
  className?: string;
};

function PageHeaderRight({ children, className }: PageHeaderRightProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-h-10 items-center gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { PageHeader, PageHeaderLeft, PageHeaderRight };
