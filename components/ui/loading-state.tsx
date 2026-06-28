"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  text?: string
  overlay?: boolean // If true, overlays on top of the content
  fullScreen?: boolean // If true, overlays on the entire screen
  blur?: boolean // If true, adds backdrop blur to the overlay
  children?: React.ReactNode
}

export function LoadingState({
  isLoading,
  text = "Loading...",
  overlay = false,
  fullScreen = false,
  blur = true,
  className,
  children,
  ...props
}: LoadingStateProps) {
  // If we just wrap children and aren't loading, return children
  if (!isLoading && children) {
    return <>{children}</>
  }

  // Spinner element
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      {text && <span className="text-sm font-medium text-muted-foreground">{text}</span>}
    </div>
  )

  // Full Screen Mode
  if (fullScreen && isLoading) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80",
          blur && "backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {spinnerElement}
      </div>
    )
  }

  // Overlay Mode (Relative container overlay)
  if (overlay && isLoading) {
    return (
      <div className="relative w-full h-full min-h-[150px]">
        {/* Render children underneath (blurred out) */}
        {children && <div className={cn("opacity-40 select-none pointer-events-none transition-opacity duration-300", blur && "blur-[2px]")}>{children}</div>}
        
        {/* Loading Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-all duration-300",
            blur && "backdrop-blur-[1px]",
            className
          )}
          {...props}
        >
          {spinnerElement}
        </div>
      </div>
    )
  }

  // Flat standalone spinner
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-8 min-h-[150px] w-full",
          className
        )}
        {...props}
      >
        {spinnerElement}
      </div>
    )
  }

  return <>{children}</>
}
export { Loader2 as LoadingSpinner }
