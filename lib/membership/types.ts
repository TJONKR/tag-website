export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'trialing'
  | 'unpaid'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  user_id: string
  version: string
  signed_at: string
  pdf_url: string | null
  created_at: string
}

export type MembershipTier = 'ambassador' | 'builder'

export interface MembershipStatus {
  tier: MembershipTier
  subscription: Subscription | null
  contract: Contract | null
  canUpgrade: boolean
  canCancel: boolean
}
