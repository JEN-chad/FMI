'use client'

import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Fatal Error</h1>
            <p className="text-muted-foreground max-w-[500px]">
              A critical error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
          <div className="mt-4 flex gap-4">
            <Button onClick={() => reset()} size="lg">
              Try again
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs text-muted-foreground">
              {error.stack}
            </pre>
          )}
        </div>
      </body>
    </html>
  )
}
