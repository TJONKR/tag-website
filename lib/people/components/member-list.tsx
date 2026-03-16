'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'

import { Badge } from '@components/ui/badge'
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

interface MemberListProps {
  initialMembers: Member[]
  initialCounts: MemberCounts
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

type FilterRole = UserRole | 'all'

export const MemberList = ({ initialMembers, initialCounts }: MemberListProps) => {
  const [members, setMembers] = useState(initialMembers)
  const [counts, setCounts] = useState(initialCounts)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [selected, setSelected] = useState<Member | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

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
        <div className="ml-auto font-mono text-xs text-tag-dim leading-loose">
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
        <div className="space-y-3">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-tag-border bg-tag-card p-4 transition-colors hover:border-tag-orange/30"
              onClick={() => setSelected(member)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-grotesk font-medium text-tag-text">
                    {member.name || 'Unnamed'}
                  </span>
                  <Badge variant="outline" className={roleColors[member.role]}>
                    {roleLabels[member.role]}
                  </Badge>
                  {!member.onboarding_completed && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    >
                      onboarding
                    </Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-tag-dim">{member.email}</p>
              </div>
              <span className="ml-4 shrink-0 font-mono text-xs text-tag-dim">
                {new Date(member.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
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
                <span className="font-mono text-sm text-tag-muted">{selected.email}</span>
                <Badge variant="outline" className={roleColors[selected.role]}>
                  {roleLabels[selected.role]}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Role change */}
                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                    Role
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Select
                      value={selected.role}
                      onValueChange={(v) => handleRoleChange(selected.id, v as UserRole)}
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
                    {roleLoading && <Loader2 className="size-4 animate-spin text-tag-dim" />}
                  </div>
                </div>

                {selected.building && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Building
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {selected.building}
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                    Onboarding
                  </p>
                  <p className="mt-1 font-grotesk text-sm text-tag-text">
                    {selected.onboarding_completed ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>

              <p className="font-mono text-xs text-tag-dim">
                Joined {new Date(selected.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
