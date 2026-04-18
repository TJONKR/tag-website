'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { ExternalLink, Search, Loader2, RefreshCw, Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Input } from '@components/ui/input'
import { toast } from '@components/toast'

import type { Member, MemberCounts } from '../types'
import type { UserRole } from '@lib/auth/types'
import { slugifyName } from '@lib/utils'

interface MemberListProps {
  initialMembers: Member[]
  initialCounts: MemberCounts
  isOperator: boolean
  isSuperAdmin: boolean
}

const roleColors: Record<UserRole, string> = {
  ambassador: 'bg-tag-text/10 text-tag-muted border-tag-border',
  builder: 'bg-tag-orange/10 text-tag-orange border-tag-orange/20',
  operator: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const roleLabels: Record<UserRole, string> = {
  ambassador: 'Ambassador',
  builder: 'Builder',
  operator: 'Operator',
}

const getInitials = (name: string | null) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type FilterRole = UserRole | 'all'

export const MemberList = ({
  initialMembers,
  initialCounts,
  isOperator,
  isSuperAdmin,
}: MemberListProps) => {
  const [members, setMembers] = useState(initialMembers)
  const [counts, setCounts] = useState(initialCounts)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [selected, setSelected] = useState<Member | null>(null)
  const [enlargedAvatar, setEnlargedAvatar] = useState<Member | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = filterRole === 'all' || m.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [members, search, filterRole])

  const fetchMembers = useCallback(async () => {
    try {
      const [membersRes, countsRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/people?counts=true'),
      ])
      if (membersRes.ok) setMembers(await membersRes.json())
      if (countsRes.ok) setCounts(await countsRes.json())
    } catch {
      // Silently fail — existing data stays
    }
  }, [])

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setRoleLoading(true)
    try {
      const res = await fetch(`/api/people/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.errors?.[0]?.message || 'Failed to update role')
      }

      toast({
        type: 'success',
        description: `Role updated to ${roleLabels[newRole]}.`,
      })

      setSelected((prev) => (prev ? { ...prev, role: newRole } : null))
      await fetchMembers()
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const handleRegenerate = async (memberId: string) => {
    setRegenLoading(true)
    try {
      const res = await fetch('/api/taste/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(
          json.errors?.[0]?.message ?? 'Failed to regenerate profile'
        )
      }

      toast({
        type: 'success',
        description: 'Profile regeneration started.',
      })
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setRegenLoading(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/people/${memberId}`, { method: 'DELETE' })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.errors?.[0]?.message || 'Failed to delete member')
      }

      toast({
        type: 'success',
        description: 'Member has been deleted.',
      })

      setSelected(null)
      await fetchMembers()
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      {/* Counts summary */}
      <div className="mb-6 flex gap-4">
        {(['ambassador', 'builder', 'operator'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
            className={`rounded-lg border px-4 py-2 font-mono text-xs transition-colors ${
              filterRole === role
                ? 'border-tag-orange bg-tag-orange/10 text-tag-orange'
                : 'border-tag-border bg-tag-card text-tag-muted hover:border-tag-orange/30'
            }`}
          >
            {roleLabels[role]} ({counts[role]})
          </button>
        ))}
        <div className="ml-auto font-mono text-sm text-tag-dim leading-loose">
          {counts.total} total
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tag-dim" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-tag-border bg-tag-card pl-10 text-tag-text placeholder:text-tag-dim"
        />
      </div>

      {/* Member list */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center font-mono text-sm text-tag-dim">
          No members found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((member) => {
            const profileSlug = member.name ? slugifyName(member.name) : null
            const profileHref = profileSlug ? `/profile/${profileSlug}` : null

            return (
            <div
              key={member.id}
              className={`group flex flex-col items-center rounded-lg border border-tag-border bg-tag-card p-4 transition-all duration-300 hover:border-tag-orange/30 hover:shadow-[0_0_24px_rgba(255,95,31,0.15)] ${
                isOperator || isSuperAdmin || profileHref ? 'cursor-pointer' : ''
              }`}
              onClick={
                isOperator || isSuperAdmin
                  ? () => setSelected(member)
                  : profileHref
                    ? () => (window.location.href = profileHref)
                    : undefined
              }
            >
              <button
                type="button"
                className="mb-3 shrink-0 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  if (member.avatar_url) setEnlargedAvatar(member)
                }}
              >
                <Avatar className="size-20 cursor-pointer transition-opacity hover:opacity-80">
                  {member.avatar_url && (
                    <AvatarImage src={member.avatar_url} alt={member.name || 'Member'} />
                  )}
                  <AvatarFallback className="bg-tag-border text-lg font-medium text-tag-text">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
              <span className="w-full truncate text-center font-grotesk text-sm font-medium text-tag-text">
                {member.name || 'Unnamed'}
              </span>
              <Badge variant="outline" className={`mt-1.5 ${roleColors[member.role]}`}>
                {roleLabels[member.role]}
              </Badge>
              {member.building && (
                <p className="mt-1.5 w-full truncate text-center font-mono text-xs text-tag-dim">
                  {member.building}
                </p>
              )}
              {!member.onboarding_completed && (
                <Badge
                  variant="outline"
                  className="mt-1.5 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                >
                  onboarding
                </Badge>
              )}
            </div>
            )
          })}
        </div>
      )}

      {/* Avatar enlarge dialog */}
      <Dialog open={!!enlargedAvatar} onOpenChange={() => setEnlargedAvatar(null)}>
        <DialogContent className="flex max-w-sm flex-col items-center border-tag-border bg-tag-bg p-6">
          <DialogHeader>
            <DialogTitle className="font-syne text-lg text-tag-text">
              {enlargedAvatar?.name || 'Member'}
            </DialogTitle>
          </DialogHeader>
          {enlargedAvatar?.avatar_url && (
            <Image
              src={enlargedAvatar.avatar_url}
              alt={enlargedAvatar.name || 'Member'}
              width={192}
              height={192}
              className="mt-2 rounded-full object-cover"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail dialog (operator or super admin) */}
      {(isOperator || isSuperAdmin) && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto border-tag-border bg-tag-bg text-tag-text">
            <DialogHeader>
              <DialogTitle className="font-syne text-xl">
                {selected?.name || 'Unnamed'}
              </DialogTitle>
            </DialogHeader>

            {selected && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    {selected.avatar_url && (
                      <AvatarImage src={selected.avatar_url} alt={selected.name || 'Member'} />
                    )}
                    <AvatarFallback className="bg-tag-border text-sm font-medium text-tag-text">
                      {getInitials(selected.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-mono text-sm text-tag-muted">{selected.email}</span>
                    <div className="mt-1">
                      <Badge variant="outline" className={roleColors[selected.role]}>
                        {roleLabels[selected.role]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Role change (operator only) */}
                  {isOperator && (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-tag-dim">
                        Role
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Select
                          value={selected.role}
                          onValueChange={(v) =>
                            handleRoleChange(selected.id, v as UserRole)
                          }
                          disabled={roleLoading}
                        >
                          <SelectTrigger className="w-40 border-tag-border bg-tag-card text-tag-text">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-tag-border bg-tag-bg">
                            <SelectItem value="ambassador">Ambassador</SelectItem>
                            <SelectItem value="builder">Builder</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                          </SelectContent>
                        </Select>
                        {roleLoading && (
                          <Loader2 className="size-4 animate-spin text-tag-dim" />
                        )}
                      </div>
                    </div>
                  )}

                  {selected.building && (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-tag-dim">
                        Building
                      </p>
                      <p className="mt-1 font-grotesk text-sm text-tag-text">
                        {selected.building}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-tag-dim">
                      Onboarding
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {selected.onboarding_completed ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>

                <p className="font-mono text-sm text-tag-dim">
                  Joined {new Date(selected.created_at).toLocaleDateString()}
                </p>

                <div className="flex flex-wrap items-center gap-2 border-t border-tag-border pt-4">
                  {selected.name && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-tag-border text-tag-text hover:border-tag-orange hover:text-tag-orange"
                      onClick={() => {
                        window.open(`/profile/${slugifyName(selected.name!)}`, '_blank')
                      }}
                    >
                      <ExternalLink className="size-4" />
                      View profile
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={regenLoading}
                      className="gap-2 border-tag-border text-tag-text hover:border-tag-orange hover:text-tag-orange"
                      onClick={() => handleRegenerate(selected.id)}
                    >
                      {regenLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      Regenerate profile
                    </Button>
                  )}
                  {isOperator && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-tag-border bg-tag-bg text-tag-text">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete member</AlertDialogTitle>
                        <AlertDialogDescription className="text-tag-muted">
                          Are you sure you want to delete{' '}
                          <span className="font-medium text-tag-text">
                            {selected.name || selected.email}
                          </span>
                          ? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-tag-border bg-tag-card text-tag-text hover:bg-tag-card/80">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(selected.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
