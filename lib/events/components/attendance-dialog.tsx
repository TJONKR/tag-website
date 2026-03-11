'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, Users, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { cn } from '@lib/utils'
import { toast } from '@components/toast'

interface Member {
  id: string
  name: string | null
  role: string
}

interface Attendee {
  user_id: string
  name: string | null
}

interface AttendanceDialogProps {
  eventId: string
  eventTitle: string
}

export const AttendanceDialog = ({ eventId, eventTitle }: AttendanceDialogProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const load = async () => {
      setLoading(true)
      try {
        const [membersRes, attendeesRes] = await Promise.all([
          fetch('/api/members'),
          fetch(`/api/events/${eventId}/attendance`),
        ])

        if (membersRes.ok && attendeesRes.ok) {
          const membersData: Member[] = await membersRes.json()
          const attendeesData: Attendee[] = await attendeesRes.json()
          setMembers(membersData)
          setAttendeeIds(new Set(attendeesData.map((a) => a.user_id)))
        }
      } catch {
        toast({ type: 'error', description: 'Failed to load data' })
      }
      setLoading(false)
    }

    load()
  }, [open, eventId])

  const toggle = async (userId: string) => {
    setToggling(userId)
    const isAttending = attendeeIds.has(userId)

    // Optimistic update
    setAttendeeIds((prev) => {
      const next = new Set(prev)
      if (isAttending) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })

    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: isAttending ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        // Revert on failure
        setAttendeeIds((prev) => {
          const next = new Set(prev)
          if (isAttending) {
            next.add(userId)
          } else {
            next.delete(userId)
          }
          return next
        })
        throw new Error()
      }
    } catch {
      toast({ type: 'error', description: 'Failed to update attendance' })
    }

    setToggling(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) router.refresh()
  }

  const selectedMembers = members.filter((m) => attendeeIds.has(m.id))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="rounded p-1.5 text-tag-muted transition-colors hover:bg-tag-card hover:text-tag-text"
          aria-label="Manage attendance"
        >
          <Users className="size-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne">Attendance</DialogTitle>
          <p className="text-sm text-tag-muted">{eventTitle}</p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-tag-muted">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Multi-select combobox */}
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  aria-controls="attendance-members"
                  className="flex w-full items-center justify-between rounded-md border border-tag-border bg-tag-card px-3 py-2 text-sm text-tag-text transition-colors hover:border-tag-dim"
                >
                  <span className="text-tag-muted">
                    {attendeeIds.size > 0
                      ? `${attendeeIds.size} member${attendeeIds.size !== 1 ? 's' : ''} selected`
                      : 'Select members...'}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 text-tag-dim" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-tag-border bg-tag-bg p-0">
                <Command id="attendance-members" className="bg-tag-bg">
                  <CommandInput
                    placeholder="Search members..."
                    className="text-tag-text placeholder:text-tag-muted"
                  />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty className="text-tag-muted">No members found.</CommandEmpty>
                    <CommandGroup>
                      {members.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.name || member.id}
                          disabled={toggling === member.id}
                          onSelect={() => toggle(member.id)}
                          className="cursor-pointer text-tag-text data-[selected=true]:bg-tag-card"
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              attendeeIds.has(member.id)
                                ? 'text-tag-orange opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <span>{member.name || 'Unnamed'}</span>
                          <span className="ml-auto text-xs text-tag-dim">{member.role}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected members as badges */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => toggle(member.id)}
                    disabled={toggling === member.id}
                    className="flex items-center gap-1 rounded-full border border-tag-border bg-tag-card px-2.5 py-1 text-xs text-tag-text transition-colors hover:border-tag-orange/50 disabled:opacity-50"
                  >
                    {member.name || 'Unnamed'}
                    <X className="size-3 text-tag-muted" />
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-tag-border pt-3 text-right">
              <span className="text-xs text-tag-muted">
                {attendeeIds.size} attendee{attendeeIds.size !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
