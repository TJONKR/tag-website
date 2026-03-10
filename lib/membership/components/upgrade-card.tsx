'use client'

import { Rocket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@components/ui/button'

import { ContractDialog } from './contract-dialog'

export const UpgradeCard = () => {
  const [showContract, setShowContract] = useState(false)

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
              €150/month.
            </p>
            <Button
              onClick={() => setShowContract(true)}
              className="mt-4 bg-tag-orange text-white hover:bg-tag-orange/90"
            >
              Upgrade to Builder
            </Button>
          </div>
        </div>
      </div>

      <ContractDialog open={showContract} onOpenChange={setShowContract} />
    </>
  )
}
