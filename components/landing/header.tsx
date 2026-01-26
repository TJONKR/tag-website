'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowRight, Moon, Sun } from 'lucide-react'

import { Button } from '@components/ui/button'
import { LogoBrand } from './logo-brand'

const navLinkClass =
  'font-funnel text-[17px] font-medium leading-[21px] text-[#1E1E1E] transition-colors hover:text-[#FF3D44] dark:text-white dark:hover:text-[#FF3D44]'

export const Header = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-8">
        {/* Logo */}
        <LogoBrand />

        {/* Right side: Nav + Actions */}
        <div className="flex items-center gap-8">
          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#" className={navLinkClass}>
              Who
            </Link>
            <Link href="#" className={navLinkClass}>
              Agenda
            </Link>
            <Link href="#" className={navLinkClass}>
              Builders
            </Link>
          </nav>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-[#1E1E1E] hover:text-[#FF3D44] dark:text-white dark:hover:text-[#FF3D44]"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Login Button */}
          <button className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#2C2C2C] bg-[#2C2C2C] p-3 text-base leading-none text-[#F5F5F5] transition-colors hover:bg-[#3C3C3C] dark:border-[#F5F5F5] dark:bg-[#F5F5F5] dark:text-[#2C2C2C] dark:hover:bg-[#E5E5E5]">
            Log in
            <ArrowRight className="size-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </header>
  )
}
