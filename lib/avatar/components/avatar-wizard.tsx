'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, RefreshCw, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@lib/utils'
import { PhotoUpload } from '@lib/photos/components'
import { MAX_PHOTOS } from '@lib/photos/types'
import type { UserPhoto } from '@lib/photos/types'
import { useAvatarStatus } from '@lib/avatar/hooks'

type WizardStep = 'photos' | 'generating' | 'result'

interface AvatarWizardProps {
  initialPhotos: UserPhoto[]
  photoUrls: Record<string, string>
}

export const AvatarWizard = ({ initialPhotos, photoUrls }: AvatarWizardProps) => {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('photos')
  const [jobId, setJobId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const { job } = useAvatarStatus({ jobId: step === 'generating' ? jobId : null })

  // Transition to result when generation completes
  if (job?.status === 'complete' && step === 'generating') {
    setStep('result')
  }

  if (job?.status === 'error' && step === 'generating') {
    toast.error('Avatar generation failed. Please try again.')
    setStep('photos')
    setJobId(null)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/avatar/generate', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to start generation')
        return
      }

      setJobId(data.jobId)
      setStep('generating')
    } catch {
      toast.error('Failed to start generation')
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirm = async () => {
    if (!jobId) return

    try {
      const res = await fetch('/api/avatar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save avatar')
        return
      }

      toast.success('Avatar updated!')
      router.push('/portal/profile')
      router.refresh()
    } catch {
      toast.error('Failed to save avatar')
    }
  }

  const handleRegenerate = async () => {
    setStep('generating')
    setJobId(null)
    await handleGenerate()
  }

  const handleChangePhotos = () => {
    setStep('photos')
    setJobId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/portal/profile')}
          className="flex size-8 items-center justify-center rounded-lg border border-tag-border bg-tag-card transition-colors hover:bg-tag-border/50"
        >
          <ArrowLeft className="size-4 text-tag-muted" />
        </button>
        <div>
          <h1 className="font-syne text-xl font-bold text-tag-text">Update Avatar</h1>
          <p className="text-xs text-tag-muted">
            {step === 'photos' && 'Upload reference photos to generate your avatar'}
            {step === 'generating' && 'Generating your avatar...'}
            {step === 'result' && 'Here is your generated avatar'}
          </p>
        </div>
      </div>

      {/* Step 1: Photos */}
      {step === 'photos' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-tag-border bg-tag-card p-6">
            <PhotoUpload
              initialPhotos={initialPhotos}
              photoUrls={photoUrls}
              context="avatar"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={initialPhotos.length < MAX_PHOTOS || generating}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              initialPhotos.length >= MAX_PHOTOS
                ? 'bg-tag-orange text-white hover:bg-tag-orange/90'
                : 'cursor-not-allowed bg-tag-border text-tag-dim'
            )}
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Starting generation...
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Generate Avatar
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-tag-border bg-tag-card py-20">
          <div className="relative">
            <div className="size-16 animate-spin rounded-full border-4 border-tag-border border-t-tag-orange" />
          </div>
          <p className="mt-6 font-syne text-lg font-bold text-tag-text">
            Creating your avatar
          </p>
          <p className="mt-2 text-sm text-tag-muted">
            This usually takes 15-30 seconds...
          </p>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && job?.image_url && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-tag-border bg-tag-card">
            <div className="relative aspect-[3/4]">
              <Image
                src={job.image_url}
                alt="Generated avatar"
                fill
                className="object-cover"
                sizes="500px"
                unoptimized
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-tag-orange px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-tag-orange/90"
            >
              <Check className="size-4" />
              Use as Avatar
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                title="Regenerate with same photos"
                className="flex items-center justify-center gap-2 rounded-lg border border-tag-border bg-tag-card px-4 py-3 text-sm font-medium text-tag-text transition-colors hover:bg-tag-border/50"
              >
                <RefreshCw className="size-4" />
              </button>
              <button
                onClick={handleChangePhotos}
                title="Change reference photos"
                className="flex items-center justify-center gap-2 rounded-lg border border-tag-border bg-tag-card px-4 py-3 text-sm font-medium text-tag-text transition-colors hover:bg-tag-border/50"
              >
                <ImagePlus className="size-4" />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-tag-muted">
            Not happy? Click <RefreshCw className="inline size-3" /> to regenerate or{' '}
            <ImagePlus className="inline size-3" /> to change your photos.
          </p>
        </div>
      )}
    </div>
  )
}
