'use client'

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'

import { signContract } from '../actions'
import {
  CONTRACT_VERSION,
  contractTemplates,
  renderContractSections,
  type ContractFieldData,
  type ContractLanguage,
} from '../contract-template'
import { contractFieldsSchema } from '../schema'

interface ContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'form' | 'preview'

const initialFields: ContractFieldData = {
  companyName: '',
  kvk: '',
  city: '',
  representativeName: '',
  language: 'nl',
}

export const ContractDialog = ({ open, onOpenChange }: ContractDialogProps) => {
  const [step, setStep] = useState<Step>('form')
  const [fields, setFields] = useState<ContractFieldData>(initialFields)
  const [accepted, setAccepted] = useState(false)
  const [signing, setSigning] = useState(false)

  const template = useMemo(
    () => renderContractSections(fields, new Date()),
    [fields]
  )

  const reset = () => {
    setStep('form')
    setFields(initialFields)
    setAccepted(false)
    setSigning(false)
  }

  const handleClose = (next: boolean) => {
    if (!next && !signing) reset()
    onOpenChange(next)
  }

  const handleNext = () => {
    const result = contractFieldsSchema.safeParse(fields)
    if (!result.success) {
      toast({
        type: 'error',
        description: result.error.issues[0]?.message ?? 'Please fill all fields',
      })
      return
    }
    setStep('preview')
  }

  const handleSign = async () => {
    setSigning(true)

    const result = await signContract(fields)

    if (result.status === 'success') {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', description: 'Failed to start checkout.' })
        setSigning(false)
      }
    } else {
      toast({
        type: 'error',
        description: result.error ?? 'Failed to sign contract.',
      })
      setSigning(false)
    }
  }

  const setField = <K extends keyof ContractFieldData>(
    key: K,
    value: ContractFieldData[K]
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl text-tag-text">
            {step === 'form'
              ? 'Builder Sub-lease Agreement'
              : contractTemplates[fields.language].title}
          </DialogTitle>
          <p className="text-xs text-tag-dim">
            {contractTemplates[fields.language].versionLabel} {CONTRACT_VERSION}
          </p>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-tag-muted">
              Fill in your company details. We&apos;ll generate the sub-lease
              agreement and you can review it before signing.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={fields.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  placeholder="Pre-seed AI B.V."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kvk">KVK number</Label>
                <Input
                  id="kvk"
                  value={fields.kvk}
                  onChange={(e) => setField('kvk', e.target.value.replace(/\D/g, ''))}
                  placeholder="8 digits"
                  maxLength={8}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={fields.city}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder="Amsterdam"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="representativeName">Representative name</Label>
                <Input
                  id="representativeName"
                  value={fields.representativeName}
                  onChange={(e) => setField('representativeName', e.target.value)}
                  placeholder="The one with the pen"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="language">Contract language</Label>
                <Select
                  value={fields.language}
                  onValueChange={(v) => setField('language', v as ContractLanguage)}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nl">Nederlands</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded border border-tag-border bg-tag-bg-deep/30 p-3 text-xs text-tag-dim">
              <strong className="text-tag-text">€150 / month excl. 21% VAT</strong>{' '}
              — 1 flexible desk at Jacob Bontiusplaats 9-23, monthly auto-renewing,
              cancel before the 15th.
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-2">
            <div className="rounded border border-tag-border bg-tag-bg-deep/30 p-4">
              {template.sections.map((section) => (
                <div key={section.title} className="mb-4 last:mb-0">
                  <h4 className="text-sm font-semibold text-tag-text">
                    {section.title}
                  </h4>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-tag-muted">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <label className="flex cursor-pointer items-start gap-3 border-t border-tag-border pt-4">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 size-4 rounded border-tag-border accent-tag-orange"
              />
              <span className="text-sm text-tag-muted">
                {fields.language === 'nl'
                  ? 'Ik heb de overeenkomst gelezen en ga akkoord met de voorwaarden.'
                  : 'I have read and agree to the terms of this sub-lease agreement.'}
              </span>
            </label>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'preview' && (
            <Button
              variant="outline"
              onClick={() => setStep('form')}
              className="border-tag-border text-tag-muted"
              disabled={signing}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="border-tag-border text-tag-muted"
            disabled={signing}
          >
            Cancel
          </Button>
          {step === 'form' ? (
            <Button
              onClick={handleNext}
              className="bg-tag-orange text-white hover:bg-tag-orange/90"
            >
              Review contract
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSign}
              disabled={!accepted || signing}
              className="bg-tag-orange text-white hover:bg-tag-orange/90 disabled:opacity-50"
            >
              {signing && <Loader2 className="mr-2 size-4 animate-spin" />}
              {signing ? 'Processing...' : 'Sign & Continue to Payment'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
