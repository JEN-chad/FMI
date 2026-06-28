import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border", className)}>
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-2 sm:mt-0">{children}</div>}
    </div>
  );
}

interface PageHeaderTopbarProps {
  children?: ReactNode;
  className?: string;
}

export function PageHeaderTopbar({ children, className }: PageHeaderTopbarProps) {
  return (
    <div className={cn("h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-10", className)}>
      {children}
    </div>
  );
}
