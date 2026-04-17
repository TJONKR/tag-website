'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import type { Member, MemberCounts } from '../types'
import type { Application, ApplicationCounts } from '@lib/applications/types'
import type { AiAmClaimWithUser } from '@lib/membership/types'
import { MemberList } from './member-list'
import { ApplicationList, InviteDialog } from '@lib/applications/components'
import { ClaimList } from '@lib/membership/components'

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
    return <MemberList initialMembers={members} initialCounts={memberCounts} isOperator={false} />
  }

  const validTabs = ['members', 'applications', ...(isSuperAdmin ? ['claims'] : [])]
  const defaultTab = initialTab && validTabs.includes(initialTab) ? initialTab : 'members'

  return (
    <Tabs defaultValue={defaultTab}>
      <div className="flex items-center justify-between">
        <TabsList className="border-tag-border bg-tag-card">
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Members ({memberCounts.total})
          </TabsTrigger>
          {isOperator && (
            <TabsTrigger
              value="applications"
              className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
            >
              Applications ({applicationCounts.pending} pending)
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger
              value="claims"
              className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
            >
              Claims ({claims.length} pending)
            </TabsTrigger>
          )}
        </TabsList>
        {isOperator && <InviteDialog />}
      </div>

      <TabsContent value="members" className="mt-6">
        <MemberList initialMembers={members} initialCounts={memberCounts} isOperator={isOperator} />
      </TabsContent>

      {isOperator && (
        <TabsContent value="applications" className="mt-6">
          <ApplicationList
            initialApplications={applications}
            initialCounts={applicationCounts}
          />
        </TabsContent>
      )}

      {isSuperAdmin && (
        <TabsContent value="claims" className="mt-6">
          <ClaimList initialClaims={claims} />
        </TabsContent>
      )}
    </Tabs>
  )
}
