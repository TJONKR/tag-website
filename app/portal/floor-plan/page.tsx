import { PortalHeader, FloorPlanMap } from '@lib/portal/components'

export default function FloorPlanPage() {
  return (
    <>
      <PortalHeader
        title="Floor Plan & Spaces"
        description="Interactive overview of the workspace. Hover over a desk to see its details."
      />
      <FloorPlanMap />
    </>
  )
}
