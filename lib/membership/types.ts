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
  company_name: string | null
  kvk: string | null
  city: string | null
  representative_name: string | null
  language: 'nl' | 'en' | null
  created_at: string
}

export type AiAmClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked'

export interface AiAmClaim {
  id: string
  user_id: string
  status: AiAmClaimStatus
  submitted_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
}

export interface AiAmClaimWithUser extends AiAmClaim {
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export type MembershipTier = 'ambassador' | 'builder'

export interface MembershipStatus {
  tier: MembershipTier
  subscription: Subscription | null
  contract: Contract | null
  aiAmClaim: AiAmClaim | null
  canUpgrade: boolean
  canCancel: boolean
}
