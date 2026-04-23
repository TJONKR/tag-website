'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import type { Member, MemberCounts } from '../types'
import type { Application, ApplicationCounts } from '@lib/applications/types'
import type { AiAmClaimWithUser } from '@lib/membership/types'
import { MemberList } from './member-list'
import { ApplicationList } from '@lib/applications/components'
import { ClaimList } from '@lib/membership/components'
import {
  PORTAL_TABS_LIST_CLASSES,
  PORTAL_TABS_TRIGGER_CLASSES,
} from '@lib/portal/components/portal-tabs-style'

interface PeopleTabsProps {
  members: Member[]
  memberCounts: MemberCounts
  applications: Application[]
  applicationCounts: ApplicationCounts
  claims: AiAmClaimWithUser[]
  isOperator: boolean
  isSuperAdmin: boolean
  initialTab?: string
}

export const PeopleTabs = ({
  members,
  memberCounts,
  applications,
  applicationCounts,
  claims,
  isOperator,
  isSuperAdmin,
  initialTab,
}: PeopleTabsProps) => {
  if (!isOperator && !isSuperAdmin) {
    return (
      <MemberList
        initialMembers={members}
        initialCounts={memberCounts}
        isOperator={false}
        isSuperAdmin={false}
      />
    )
  }

  const validTabs = ['members', 'applications', ...(isSuperAdmin ? ['claims'] : [])]
  const defaultTab = initialTab && validTabs.includes(initialTab) ? initialTab : 'members'

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className={PORTAL_TABS_LIST_CLASSES}>
        <TabsTrigger value="members" className={PORTAL_TABS_TRIGGER_CLASSES}>
          Members ({memberCounts.total})
        </TabsTrigger>
        {isOperator && (
          <TabsTrigger value="applications" className={PORTAL_TABS_TRIGGER_CLASSES}>
            Applications ({applicationCounts.pending} pending)
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="claims" className={PORTAL_TABS_TRIGGER_CLASSES}>
            Claims ({claims.length} pending)
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="members" className="mt-0">
        <MemberList
          initialMembers={members}
          initialCounts={memberCounts}
          isOperator={isOperator}
          isSuperAdmin={isSuperAdmin}
        />
      </TabsContent>

      {isOperator && (
        <TabsContent value="applications" className="mt-0">
          <ApplicationList
            initialApplications={applications}
            initialCounts={applicationCounts}
          />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="claims" className="mt-0">
          <ClaimList initialClaims={claims} />
        </TabsContent>
      )}
    </Tabs>
  )
}
