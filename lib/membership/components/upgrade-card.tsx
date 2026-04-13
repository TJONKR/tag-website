'use client'

import { Building2, Rocket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@components/ui/button'

import { AiAmClaimDialog } from './ai-am-claim-dialog'
import { ContractDialog } from './contract-dialog'

export const UpgradeCard = () => {
  const [showContract, setShowContract] = useState(false)
  const [showClaim, setShowClaim] = useState(false)

  return (
    <>
      <div className="rounded-lg border-2 border-dashed border-tag-orange/30 bg-tag-orange/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-tag-orange/10 p-2">
            <Rocket className="size-5 text-tag-orange" />
          </div>
          <div className="flex-1">
            <h3 className="font-syne text-lg font-bold text-tag-text">
              Become a Builder
            </h3>
            <p className="mt-1 text-sm text-tag-muted">
              Get a dedicated desk, 24/7 access, meeting rooms, and more for
              €150/month (excl. VAT).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => setShowContract(true)}
                className="bg-tag-orange text-white hover:bg-tag-orange/90"
              >
                <Rocket className="mr-2 size-4" />
                Pay via TAG
              </Button>
              <Button
                onClick={() => setShowClaim(true)}
                variant="outline"
                className="border-tag-border text-tag-text hover:bg-tag-card"
              >
                <Building2 className="mr-2 size-4" />
                I pay through AI/AM
              </Button>
            </div>
            <p className="mt-3 text-xs text-tag-dim">
              Already have a direct contract with AI AM? Use the second option —
              we&apos;ll verify and approve.
            </p>
          </div>
        </div>
      </div>

      <ContractDialog open={showContract} onOpenChange={setShowContract} />
      <AiAmClaimDialog open={showClaim} onOpenChange={setShowClaim} />
    </>
  )
}
