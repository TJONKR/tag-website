'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@components/ui/sheet'
import { cn } from '@lib/utils'

const navLinks = [
  { label: 'Space', href: '/space' },
  { label: 'Events', href: '/events' },
  { label: 'Ecosystem', href: '/ecosystem' },
  { label: 'Join', href: '/join' },
]

export const StickyNav = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isPortal = pathname.startsWith('/portal')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isHome) return

    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  if (isPortal) return null

  const visible = isHome ? scrolled : true

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none',
        isHome ? 'bg-tag-bg/95 backdrop-blur-md' : 'bg-tag-bg',
        'border-b border-tag-border'
      )}
    >
      <div className="flex h-14 items-center justify-between px-[60px] max-md:px-6">
        {/* Logo */}
        <Link href="/" className="font-syne text-xl font-extrabold text-tag-text">
          TAG
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-mono text-[12px] uppercase tracking-[0.1em] transition-colors',
                pathname === link.href ? 'text-tag-orange' : 'text-tag-muted hover:text-tag-text'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button aria-label="Open menu" className="text-tag-text">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] border-tag-border bg-tag-bg p-0"
          >
            <div className="flex h-14 items-center justify-between px-6">
              <span className="font-syne text-xl font-extrabold text-tag-text">TAG</span>
              <SheetClose asChild>
                <button aria-label="Close menu" className="text-tag-text">
                  <X className="size-5" />
                </button>
              </SheetClose>
            </div>
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'border-t border-tag-border px-6 py-4 font-mono text-[13px] uppercase tracking-[0.1em] transition-colors',
                    pathname === link.href
                      ? 'bg-tag-card text-tag-orange'
                      : 'text-tag-muted hover:text-tag-text'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
