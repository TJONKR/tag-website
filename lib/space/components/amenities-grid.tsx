import {
  Monitor,
  Wifi,
  Users,
  Calendar,
  Coffee,
  Clock,
  DoorOpen,
  Presentation,
} from 'lucide-react'

import { amenities } from '@lib/space/data'

import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Wifi,
  Users,
  Calendar,
  Coffee,
  Clock,
  DoorOpen,
  Presentation,
}

export const AmenitiesGrid = () => {
  return (
    <section className="px-[60px] py-24 max-md:px-8">
      <h2 className="mb-12 font-mono text-sm uppercase tracking-[0.08em] text-tag-muted">
        What you get
      </h2>
      <div className="grid grid-cols-4 gap-px border border-tag-border max-md:grid-cols-2">
        {amenities.map((amenity) => {
          const Icon = iconMap[amenity.icon]
          return (
            <div
              key={amenity.label}
              className="border border-tag-border p-6"
            >
              {Icon && <Icon className="size-6 text-tag-orange" />}
              <p className="mt-4 font-mono text-sm text-tag-text">{amenity.label}</p>
              <p className="mt-2 text-sm text-tag-muted">{amenity.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
