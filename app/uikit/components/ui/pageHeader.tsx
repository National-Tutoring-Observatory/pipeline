import { cn } from "@/lib/utils"

export type PageHeaderProps = {
  children: React.ReactNode
  className?: string
}

function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 pb-4  min-h-10", className)}>
      {children}
    </div>
  )
}

export type PageHeaderLeftProps = {
  children: React.ReactNode
  className?: string
}

function PageHeaderLeft({ children, className }: PageHeaderLeftProps) {
  return (
    <div className={cn("flex items-center gap-2 min-h-10", className)}>
      {children}
    </div>
  )
}

export type PageHeaderRightProps = {
  children: React.ReactNode
  className?: string
}

function PageHeaderRight({ children, className }: PageHeaderRightProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground min-h-10", className)}>
      {children}
    </div>
  )
}

export { PageHeader, PageHeaderLeft, PageHeaderRight }
