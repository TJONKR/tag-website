'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { signOutAction } from '@lib/auth/actions'

export const SignOutForm = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOutAction()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-lg border border-tag-border bg-tag-card px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-tag-muted transition-colors hover:border-tag-dim hover:text-tag-text"
    >
      <LogOut className="size-3.5" />
      Sign out
    </button>
  )
}
