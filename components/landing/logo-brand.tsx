import Link from 'next/link'

import { cn } from '@lib/utils'
import { Logo } from './logo'

interface LogoBrandProps {
  className?: string
  logoSize?: string
  variant?: 'light' | 'dark'
}

export const LogoBrand = ({ className, logoSize = 'size-8', variant = 'light' }: LogoBrandProps) => {
  const textColor = variant === 'dark' ? 'text-white' : 'text-foreground'
  const subtitleColor = variant === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Logo className={logoSize} />
      <span className="flex items-baseline gap-1 font-funnel font-medium">
        <span className={cn('text-[32px] leading-none', textColor)}>ai.am</span>
        <span className={cn('text-[17px] leading-none', subtitleColor)}>Builders</span>
      </span>
    </Link>
  )
}
