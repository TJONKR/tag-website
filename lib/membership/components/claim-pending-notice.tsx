import { Building2, Clock } from 'lucide-react'

import type { AiAmClaim } from '../types'

interface ClaimPendingNoticeProps {
  claim: AiAmClaim
}

export const ClaimPendingNotice = ({ claim }: ClaimPendingNoticeProps) => {
  const submitted = new Date(claim.submitted_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-tag-orange/10 p-2">
          <Building2 className="size-5 text-tag-orange" />
        </div>
        <div className="flex-1">
          <h3 className="font-syne text-lg font-bold text-tag-text">
            AI/AM claim submitted
          </h3>
          <p className="mt-1 text-sm text-tag-muted">
            We&apos;re verifying your direct contract with AI AM B.V. You&apos;ll
            be promoted to Builder once approved by Tijs or Pieter.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-tag-dim">
            <Clock className="size-3.5" />
            Submitted on {submitted}
          </div>
        </div>
      </div>
    </div>
  )
}
