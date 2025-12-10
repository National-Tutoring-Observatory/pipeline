import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

type WithClassName = React.PropsWithChildren<{ className?: string }>;
type WithActionButton = React.PropsWithChildren<{
  onClick: () => void;
  className?: string;
}>;

function DangerZone({ children, className }: WithClassName) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

function DangerZoneTitle({ children, className }: WithClassName) {
  return (
    <div className={cn("text-sm font-medium text-foreground", className)}>
      {children ?? "Danger Zone"}
    </div>
  );
}

function DangerZonePanel({ children, className }: WithClassName) {
  return (
    <div
      className={cn(
        "border border-destructive/20 rounded-md p-4 w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DangerZoneActionRowProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  buttonLabel: string;
  buttonClassName?: string;
  buttonOnClick: () => void;
};

function DangerZoneActionRow({
  title,
  description,
  className,
  contentClassName,
  buttonLabel,
  buttonClassName,
  buttonOnClick,
}: DangerZoneActionRowProps) {
  return (
    <DangerZoneAction className={className}>
      <DangerZoneActionContent className={contentClassName}>
        <DangerZoneActionTitle>{title}</DangerZoneActionTitle>
        {description ? (
          <DangerZoneActionDescription>
            {description}
          </DangerZoneActionDescription>
        ) : null}
      </DangerZoneActionContent>
      <DangerZoneActionButton
        className={buttonClassName}
        onClick={buttonOnClick}
      >
        {buttonLabel}
      </DangerZoneActionButton>
    </DangerZoneAction>
  );
}

function DangerZoneDescription({ children, className }: WithClassName) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

function DangerZoneAction({ children, className }: WithClassName) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {children}
    </div>
  );
}

function DangerZoneActionContent({ children, className }: WithClassName) {
  return <div className={cn(className)}>{children}</div>;
}

function DangerZoneActionTitle({ children, className }: WithClassName) {
  return <p className={cn("text-sm", className)}>{children}</p>;
}

function DangerZoneActionDescription({ children, className }: WithClassName) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

function DangerZoneActionButton({
  children,
  onClick,
  className,
}: WithActionButton) {
  return (
    <Button
      type="button"
      variant="destructive"
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export {
  DangerZone,
  DangerZoneAction,
  DangerZoneActionButton,
  DangerZoneActionContent,
  DangerZoneActionDescription,
  DangerZoneActionRow,
  DangerZoneActionTitle,
  DangerZoneDescription,
  DangerZonePanel,
  DangerZoneTitle
};
