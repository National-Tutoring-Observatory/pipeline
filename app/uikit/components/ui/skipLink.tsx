import { cn } from "@/lib/utils";

export function SkipLink({
  href,
  children,
  className,
}: {
  href: string;
  children: string;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href) as HTMLElement | null;
    target?.focus();
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "bg-background focus-visible:ring-ring sr-only fixed -top-full left-0 z-50 rounded px-4 py-2 text-sm focus:top-0 focus:left-0 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </a>
  );
}
