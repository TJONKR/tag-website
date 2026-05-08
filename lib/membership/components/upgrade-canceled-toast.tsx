'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { toast } from '@components/toast'

export const UpgradeCanceledToast = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    if (searchParams.get('upgrade') !== 'canceled') return
    fired.current = true

    toast({
      type: 'error',
      description: "Checkout canceled — your membership wasn't started.",
    })

    const params = new URLSearchParams(searchParams.toString())
    params.delete('upgrade')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  return null
}
