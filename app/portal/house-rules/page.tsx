import { ScrollText } from 'lucide-react'

import { PortalHeader, InfoCard } from '@lib/portal/components'
import { houseRules } from '@lib/portal/data'

export default function HouseRulesPage() {
  return (
    <>
      <PortalHeader
        title="House Rules"
        description="To keep TAG enjoyable for everyone, we ask you to respect these rules."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {houseRules.map((rule) => (
          <InfoCard
            key={rule.title}
            title={rule.title}
            description={rule.description}
            icon={<ScrollText className="size-4" />}
          />
        ))}
      </div>
    </>
  )
}
