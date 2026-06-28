"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, Menu, X, ArrowRight, User, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Marketplace", href: "#marketplace-preview" },
  { label: "Categories", href: "#categories" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
]

export default function NavbarLanding() {
  const { theme, setTheme } = useTheme()
  const { data: session } = authClient.useSession()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      const topOffset = 80 // offset for sticky navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand/Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex size-9 items-center justify-center rounded-lg fmi-gradient text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              F
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              FMI
            </span>
            <span className="rounded-full bg-brand/10 border border-brand/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
              India
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}

          {/* Auth CTAs */}
          {mounted && (
            <>
              {session?.user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-secondary/40 text-foreground"
                    render={<Link href="/buyer/dashboard" />}
                  >
                    <User className="mr-1.5 size-3.5" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="mr-1.5 size-3.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    render={<Link href="/auth/login" />}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg shadow-xs"
                    render={<Link href="/auth/signup" />}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="ml-1 size-3.5 transition-transform group-hover/button:translate-x-0.5" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950 md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-base font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 py-1"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-zinc-200 dark:border-zinc-800" />
              {session?.user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-bold dark:bg-zinc-800 dark:text-zinc-300">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-55">
                        {session.user.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-zinc-200 dark:border-zinc-800"
                    render={<Link href="/buyer/dashboard" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-center" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-zinc-200 dark:border-zinc-800"
                    render={<Link href="/auth/login" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black"
                    render={<Link href="/auth/signup" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

