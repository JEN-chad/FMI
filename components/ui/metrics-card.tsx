"use client"

import * as React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricsCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number // e.g. 12.4
    label: string // e.g. "vs last month"
    isPositive: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  chartData?: { value: number }[]
  chartColor?: string
}

export function MetricsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  chartData,
  chartColor = "var(--primary)",
  className,
  children,
  ...props
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="rounded-md bg-muted/50 p-1.5 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          
          {(trend || description) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium rounded-full px-1.5 py-0.5",
                    trend.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              {trend && <span>{trend.label}</span>}
              {!trend && description && <span>{description}</span>}
            </div>
          )}
        </div>

        {/* Optional Sparkline Chart */}
        {chartData && chartData.length > 0 && (
          <div className="h-10 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${title})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  )
}
