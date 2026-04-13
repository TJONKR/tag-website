'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'

import type { Member, MemberCounts } from '../types'
import type { Application, ApplicationCounts } from '@lib/applications/types'
import { MemberList } from './member-list'
import { ApplicationList, InviteDialog } from '@lib/applications/components'

interface PeopleTabsProps {
  members: Member[]
  memberCounts: MemberCounts
  applications: Application[]
  applicationCounts: ApplicationCounts
  isOperator: boolean
}

export const PeopleTabs = ({
  members,
  memberCounts,
  applications,
  applicationCounts,
  isOperator,
}: PeopleTabsProps) => {
  if (!isOperator) {
    return <MemberList initialMembers={members} initialCounts={memberCounts} isOperator={false} />
  }

  return (
    <Tabs defaultValue="members">
      <div className="flex items-center justify-between">
        <TabsList className="border-tag-border bg-tag-card">
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Members ({memberCounts.total})
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Applications ({applicationCounts.pending} pending)
          </TabsTrigger>
        </TabsList>
        <InviteDialog />
      </div>

      <TabsContent value="members" className="mt-6">
        <MemberList initialMembers={members} initialCounts={memberCounts} isOperator={true} />
      </TabsContent>

      <TabsContent value="applications" className="mt-6">
        <ApplicationList
          initialApplications={applications}
          initialCounts={applicationCounts}
        />
      </TabsContent>
    </Tabs>
  )
}
