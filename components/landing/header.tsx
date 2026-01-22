'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowRight, Moon, Sun } from 'lucide-react'

import { Button } from '@components/ui/button'
import { LogoBrand } from './logo-brand'

export const Header = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <LogoBrand />

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Who
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Agenda
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Builders
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Login Button */}
          <Button
            variant="default"
            className="gap-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Log in
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
