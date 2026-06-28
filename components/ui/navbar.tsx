"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, Bell, User, Search, LogOut, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

interface NavLink {
  label: string
  href: string
}

interface NavbarProps {
  links?: NavLink[]
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  } | null
  onLogout?: () => void
  notificationsCount?: number
}

const defaultLinks: NavLink[] = [
  { label: "Browse Listings", href: "/buyer/listings" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
]

export function Navbar({
  links = defaultLinks,
  user = null,
  onLogout,
  notificationsCount = 0,
}: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Brand/Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:to-white/60">
              FMI
            </span>
            <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-white/10 dark:text-white sm:inline-block">
              India
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search bar (desktop) */}
          <div className="relative hidden lg:block w-48 xl:w-64">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search listings..."
              className="pl-8 h-8 text-xs rounded-lg border-muted bg-muted/30 focus-visible:bg-background"
            />
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}

          {/* Notifications */}
          {user && (
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex size-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>
          )}

          {/* User profile dropdown or Sign-in */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="rounded-full overflow-hidden border border-border">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="size-full object-cover" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {user.role && (
                      <span className="mt-1 w-fit rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                        {user.role}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/buyer/dashboard" />}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/settings" />}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
                Log in
              </Button>
              <Button size="sm" className="rounded-lg" render={<Link href="/auth/signup" />}>
                <span>Get Started</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Mobile Sheet Trigger */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Toggle menu">
                <Menu className="size-4" />
              </Button>
            } />
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left font-bold">FMI India</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Search in Mobile */}
                <div className="relative w-full">
                  <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 h-9 text-sm rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex h-9 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <hr className="border-border" />

                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="size-full object-cover" />
                        ) : (
                          <User className="size-5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" render={<Link href="/buyer/dashboard" />}>
                      Dashboard
                    </Button>
                    <Button variant="outline" size="sm" render={<Link href="/settings" />}>
                      Settings
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onLogout} className="justify-start">
                      <LogOut className="mr-2 size-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" render={<Link href="/auth/login" />}>
                      Log in
                    </Button>
                    <Button size="sm" render={<Link href="/auth/signup" />}>
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

