'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { toast } from '@components/toast'
import { updateAvatar } from '@lib/auth/actions'

interface AvatarUploadProps {
  name: string | null
  avatarUrl: string | null
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const AvatarUpload = ({ name, avatarUrl }: AvatarUploadProps) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({ type: 'error', description: 'Image must be under 2MB.' })
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    const result = await updateAvatar(formData)

    if (result.status === 'success') {
      toast({ type: 'success', description: 'Avatar updated.' })
      router.refresh()
    } else {
      toast({ type: 'error', description: 'Failed to upload avatar.' })
    }

    setUploading(false)
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="group relative"
      aria-label="Upload avatar"
    >
      <Avatar className="size-16">
        <AvatarImage src={avatarUrl ?? undefined} alt={name ?? 'Avatar'} />
        <AvatarFallback className="bg-tag-text/5 font-syne text-lg text-tag-muted">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-[10px] font-medium text-white">
          {uploading ? '...' : 'Edit'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  )
}
