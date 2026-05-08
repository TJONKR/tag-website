'use client'

import { PhotoUpload } from '@lib/photos/components/photo-upload'
import { MAX_PHOTOS } from '@lib/photos/types'
import type { UserPhoto } from '@lib/photos/types'

import { StepShell } from './step-shell'

interface PhotosStepProps {
  initialPhotos: UserPhoto[]
  photoUrls: Record<string, string>
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  onStepClick?: (step: number) => void
}

export const PhotosStep = ({
  initialPhotos,
  photoUrls,
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  onStepClick,
}: PhotosStepProps) => {
  const hasAll = initialPhotos.length >= MAX_PHOTOS

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Reference photos."
      subtitle={`Upload ${MAX_PHOTOS} photos of yourself — a clear portrait plus a couple more that capture how you show up in the world. We use them to hand-craft a unique visual for your profile later on.`}
      onBack={onBack}
      onNext={onNext}
      onSkip={onNext}
      onStepClick={onStepClick}
      nextDisabled={!hasAll}
    >
      <div className="rounded-lg border border-tag-border bg-tag-card p-6">
        <PhotoUpload initialPhotos={initialPhotos} photoUrls={photoUrls} context="lootbox" />
      </div>
    </StepShell>
  )
}
