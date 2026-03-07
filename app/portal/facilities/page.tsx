import { Coffee, Users, Wifi } from 'lucide-react'

import { PortalHeader, InfoCard } from '@lib/portal/components'
import { facilities } from '@lib/portal/data'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  users: Users,
  coffee: Coffee,
}

export default function FacilitiesPage() {
  return (
    <>
      <PortalHeader
        title="WiFi & Facilities"
        description="Everything you need to be productive at TAG."
      />
      <div className="grid gap-4">
        {facilities.map((facility) => {
          const Icon = iconMap[facility.icon]
          return (
            <InfoCard
              key={facility.name}
              title={facility.name}
              description={facility.description}
              icon={Icon ? <Icon className="size-4" /> : undefined}
            />
          )
        })}
      </div>
    </>
  )
}
