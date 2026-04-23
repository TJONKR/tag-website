'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { UserPhoto } from '@lib/photos/types'

import { AvatarStep } from './steps/avatar-step'
import { PhotosStep } from './steps/photos-step'
import { TourStep } from './steps/tour-step'
import { ProphecyStep } from './steps/prophecy-step'
import { ManifestoStep } from './steps/manifesto-step'

interface OnboardingFormProps {
  name: string | null
  avatarUrl: string | null
  initialPhotos: UserPhoto[]
  photoUrls: Record<string, string>
  isPreview: boolean
}

const TOTAL_STEPS = 5
const STEPPER_TOTAL = 4

export const OnboardingForm = ({
  name,
  avatarUrl,
  initialPhotos,
  photoUrls,
  isPreview,
}: OnboardingFormProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const step = useMemo(() => {
    const raw = Number(searchParams.get('step'))
    if (Number.isFinite(raw) && raw >= 1 && raw <= TOTAL_STEPS) return raw
    return 1
  }, [searchParams])

  const goToStep = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next <= 1) params.delete('step')
      else params.set('step', String(next))
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleNext = useCallback(() => goToStep(step + 1), [goToStep, step])
  const handleBack = useCallback(
    () => (step > 1 ? goToStep(step - 1) : undefined),
    [goToStep, step]
  )

  const handleComplete = useCallback(async () => {
    if (isPreview) {
      router.push('/portal/events')
      return
    }
    const res = await fetch('/api/profile/onboarding/finish', { method: 'POST' })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(json?.errors?.[0]?.message || 'Failed to finish onboarding')
    }
    router.push('/portal/events')
  }, [isPreview, router])

  if (step === 1) {
    return (
      <AvatarStep
        name={name}
        avatarUrl={avatarUrl}
        stepNumber={1}
        totalSteps={STEPPER_TOTAL}
        onNext={handleNext}
        onStepClick={goToStep}
      />
    )
  }

  if (step === 2) {
    return (
      <PhotosStep
        initialPhotos={initialPhotos}
        photoUrls={photoUrls}
        stepNumber={2}
        totalSteps={STEPPER_TOTAL}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={goToStep}
      />
    )
  }

  if (step === 3) {
    return (
      <TourStep
        stepNumber={3}
        totalSteps={STEPPER_TOTAL}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={goToStep}
      />
    )
  }

  if (step === 4) {
    return (
      <ProphecyStep
        stepNumber={4}
        totalSteps={STEPPER_TOTAL}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={goToStep}
      />
    )
  }

  return <ManifestoStep name={name} onComplete={handleComplete} />
}
