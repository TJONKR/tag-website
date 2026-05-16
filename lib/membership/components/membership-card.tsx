import { Check, Clock, Star } from 'lucide-react'

import { ManageSubscription } from './manage-subscription'
import type { MembershipStatus } from '../types'

interface MembershipCardProps {
  status: MembershipStatus
}

export const MembershipCard = ({ status }: MembershipCardProps) => {
  const isBuilder = status.tier === 'builder'
  const showManage = status.subscription?.status === 'active'

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card p-6">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full p-2 ${
            isBuilder
              ? 'bg-tag-orange/10 text-tag-orange'
              : 'bg-tag-card text-tag-muted'
          }`}
        >
          {isBuilder ? <Check className="size-5" /> : <Star className="size-5" />}
        </div>
        <div>
          <h3 className="font-syne text-lg font-bold text-tag-text">
            {isBuilder ? 'Builder' : 'Ambassador'}
          </h3>
          <p className="text-sm text-tag-muted">
            {isBuilder
              ? '€150/month — dedicated desk, 24/7 access'
              : 'Free — community access & events'}
          </p>
        </div>
      </div>

      {status.pendingPayment && (
        <div className="mt-4 flex items-start gap-3 border-t border-tag-border pt-4">
          <Clock className="mt-0.5 size-4 shrink-0 text-tag-orange" />
          <div className="text-sm text-tag-muted">
            <p className="font-medium text-tag-text">Payment processing</p>
            <p className="mt-1">
              Your SEPA Direct Debit is settling — Builder access activates as
              soon as the first payment clears (usually within 5 business days).
            </p>
          </div>
        </div>
      )}

      {status.subscription && (
        <div className="mt-4 flex flex-col gap-3 border-t border-tag-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm text-tag-muted">
            {status.subscription.current_period_end && (
              <p>
                Next billing:{' '}
                {new Date(
                  status.subscription.current_period_end
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
            {status.subscription.cancel_at && (
              <p className="text-tag-orange">
                Cancels on:{' '}
                {new Date(status.subscription.cancel_at).toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>
            )}
          </div>
          {showManage && <ManageSubscription />}
        </div>
      )}
    </div>
  )
}
