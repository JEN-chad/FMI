"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StepItem {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[]
  activeStep: number // 0-indexed
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
}

export function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  size = "md",
  className,
  ...props
}: StepperProps) {
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      className={cn(
        "flex w-full",
        isHorizontal ? "flex-row items-center justify-between gap-4" : "flex-col gap-6",
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const isCompleted = index < activeStep
        const isActive = index === activeStep
        const isPending = index > activeStep

        const StepIcon = step.icon

        return (
          <React.Fragment key={index}>
            <div
              className={cn(
                "flex items-start gap-3",
                isHorizontal ? "flex-1" : "w-full"
              )}
            >
              {/* Step Circle & Connector Container */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all duration-300 font-semibold select-none shadow-xs",
                    size === "sm" && "size-7 text-xs",
                    size === "md" && "size-9 text-sm",
                    size === "lg" && "size-11 text-base",
                    isCompleted && "bg-brand border-brand text-brand-foreground shadow-sm",
                    isActive && "border-brand text-brand ring-4 ring-brand/12 bg-background",
                    isPending && "border-muted text-muted-foreground bg-background"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className={cn(
                      size === "sm" && "size-4",
                      size === "md" && "size-5",
                      size === "lg" && "size-6"
                    )} />
                  ) : StepIcon ? (
                    <StepIcon className={cn(
                      size === "sm" && "size-4",
                      size === "md" && "size-5",
                      size === "lg" && "size-6"
                    )} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Vertical Connector Line (placed under the circle) */}
                {!isHorizontal && index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-[2px] transition-all duration-300 my-1 bg-muted absolute top-10 bottom-[-24px]",
                      isCompleted && "bg-brand"
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className={cn(
                "flex flex-col text-left",
                isHorizontal ? "flex-1" : "pt-1"
              )}>
                <span
                  className={cn(
                    "font-bold text-[13px] transition-colors duration-300",
                    isActive && "text-foreground",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] leading-relaxed">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Horizontal Connector Line (placed between steps) */}
            {isHorizontal && index < steps.length - 1 && (
              <div
                className={cn(
                  "hidden sm:block h-[2px] flex-1 bg-muted transition-all duration-300 mx-2",
                  isCompleted && "bg-brand"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
