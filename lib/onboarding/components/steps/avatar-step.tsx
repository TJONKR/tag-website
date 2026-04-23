'use client'

import { AvatarUpload } from '@lib/auth/components/avatar-upload'

import { StepShell } from './step-shell'

interface AvatarStepProps {
  name: string | null
  avatarUrl: string | null
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  onStepClick?: (step: number) => void
}

export const AvatarStep = ({
  name,
  avatarUrl,
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  onStepClick,
}: AvatarStepProps) => {
  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Show your face."
      subtitle="Upload a profile photo so the community can put a face to your name."
      onBack={onBack}
      onNext={onNext}
      onSkip={onNext}
      onStepClick={onStepClick}
      nextDisabled={!avatarUrl}
    >
      <div className="flex justify-center py-4">
        <AvatarUpload name={name} avatarUrl={avatarUrl} size="xl" />
      </div>
    </StepShell>
  )
}
