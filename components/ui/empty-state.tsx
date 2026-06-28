"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon?: LucideIcon
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  card?: boolean // If true, wraps inside a Card-like border and background
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  card = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 transition-all duration-300",
        card && "rounded-xl border border-border bg-card shadow-sm",
        className
      )}
      {...props}
    >
      {/* Icon Wrapper */}
      {Icon && (
        <div className="flex items-center justify-center rounded-full bg-muted/50 p-4 mb-4 text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
          <Icon className="size-8" />
        </div>
      )}

      {/* Texts */}
      <h3 className="font-semibold text-lg tracking-tight mb-1 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              size="sm"
              onClick={secondaryAction.onClick}
              render={secondaryAction.href ? <a href={secondaryAction.href} /> : undefined}
            >
              {secondaryAction.label}
            </Button>
          )}

          {action && (
            <Button
              variant={action.variant || "default"}
              size="sm"
              onClick={action.onClick}
              render={action.href ? <a href={action.href} /> : undefined}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
