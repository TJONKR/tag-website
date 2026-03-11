'use client'

import { useEffect, useState } from 'react'
import { cn } from '@lib/utils'

type ZoneType = 'flex' | 'company' | 'meeting' | 'amenity'

interface Desk {
  id: string
  number: number
  clusterId: string
  type: 'flex' | 'company'
  company?: string
}

interface DeskCluster {
  id: string
  label: string
  type: ZoneType
  company?: string
  x: number
  y: number
  w: number
  h: number
  desks: Desk[]
}

interface StaticZone {
  id: string
  label: string
  type: ZoneType
  x: number
  y: number
  w: number
  h: number
}

const makeDeskCluster = (
  id: string,
  label: string,
  type: 'flex' | 'company',
  x: number,
  y: number,
  w: number,
  h: number,
  count: number = 4,
  company?: string
): DeskCluster => ({
  id,
  label,
  type,
  company,
  x,
  y,
  w,
  h,
  desks: Array.from({ length: count }, (_, i) => ({
    id: `${id}${i + 1}`,
    number: i + 1,
    clusterId: id,
    type,
    company,
  })),
})

const deskClusters: DeskCluster[] = [
  // Top row — 3 flex clusters with custom layouts
  makeDeskCluster('A', 'Flex', 'flex', 1, 1, 5, 5, 4),
  makeDeskCluster('B', 'Flex', 'flex', 8, 1, 5, 5, 5),
  makeDeskCluster('C', 'Flex', 'flex', 15, 1, 5, 5, 5),

  // Middle row
  makeDeskCluster('D', 'Flex', 'flex', 8, 11, 5, 6, 6),
  makeDeskCluster('E', 'Flex', 'flex', 15, 11, 5, 6, 6),

  // Bottom-left — small flex above Lerai
  makeDeskCluster('F', 'Flex', 'flex', 1, 15, 5, 4, 2),

  // Bottom row
  makeDeskCluster('G', 'Lerai', 'company', 1, 21, 5, 4, 4, 'Lerai'),
  makeDeskCluster('H', 'De Franse Kamer', 'company', 15, 21, 5, 4, 4, 'De Franse Kamer'),
]

const staticZones: StaticZone[] = [
  { id: 'TV', label: 'TV Corner', type: 'amenity', x: 8, y: 7, w: 5, h: 3 },
  { id: 'MR', label: 'Meeting Room', type: 'meeting', x: 1, y: 8, w: 5, h: 6 },
  { id: 'PT', label: 'Pool Table', type: 'amenity', x: 8, y: 18, w: 5, h: 3 },
]

const TOTAL_W = 21
const TOTAL_H = 26

const clusterStyles = {
  flex: {
    zone: 'border-tag-text/15',
    zoneHover: 'border-tag-text/30 bg-tag-text/[0.03]',
    label: 'text-tag-muted/50',
    labelHover: 'text-tag-muted',
    desk: 'border-tag-text/20 bg-tag-text/[0.06] text-tag-muted',
    deskHover: 'border-tag-text/40 bg-tag-text/[0.14] text-tag-text shadow-[0_0_12px_rgba(240,235,227,0.06)]',
  },
  company: {
    zone: 'border-tag-orange/15',
    zoneHover: 'border-tag-orange/30 bg-tag-orange/[0.03]',
    label: 'text-tag-orange/40',
    labelHover: 'text-tag-orange/70',
    desk: 'border-tag-orange/25 bg-tag-orange/[0.06] text-tag-orange/70',
    deskHover: 'border-tag-orange/50 bg-tag-orange/[0.14] text-tag-orange shadow-[0_0_12px_rgba(255,95,31,0.1)]',
  },
}

const staticStyles = {
  meeting: {
    base: 'border-blue-400/20 bg-blue-400/[0.05]',
    hover: 'border-blue-400/40 bg-blue-400/[0.12] shadow-[0_0_20px_rgba(96,165,250,0.08)]',
    label: 'text-blue-400/60',
    labelHover: 'text-blue-400',
  },
  amenity: {
    base: 'border-tag-dim/20 bg-tag-dim/[0.04]',
    hover: 'border-tag-dim/35 bg-tag-dim/[0.10]',
    label: 'text-tag-muted',
    labelHover: 'text-tag-text',
  },
}

export const FloorPlanMap = () => {
  const [hoveredDesk, setHoveredDesk] = useState<Desk | null>(null)
  const [lastDesk, setLastDesk] = useState<Desk | null>(null)
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null)
  const [hoveredStatic, setHoveredStatic] = useState<string | null>(null)

  const displayDesk = hoveredDesk ?? lastDesk
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const audio = new Audio('/audio/scan.mp3')
    audio.volume = 0.1
    audio.play().catch(() => {})

    const allIds = [
      ...staticZones.map((z) => z.id),
      ...deskClusters.map((c) => c.id),
    ]
    // Shuffle for glitch effect
    const shuffled = [...allIds].sort(() => Math.random() - 0.5)

    shuffled.forEach((id, i) => {
      // Fast stagger: 15-50ms between each
      const delay = i * (15 + Math.random() * 35)
      setTimeout(() => {
        setVisibleElements((prev) => new Set([...prev, id]))
      }, delay)
      // Glitch: briefly hide and re-show some elements
      if (Math.random() > 0.5) {
        const flickDelay = delay + 60 + Math.random() * 40
        setTimeout(() => {
          setVisibleElements((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }, flickDelay)
        setTimeout(() => {
          setVisibleElements((prev) => new Set([...prev, id]))
        }, flickDelay + 30 + Math.random() * 30)
      }
    })

    const totalTime = shuffled.length * 50 + 150
    setTimeout(() => setLoaded(true), totalTime)
  }, [])

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.15em]">
        <div className="flex items-center gap-2">
          <div className="size-2.5 border border-tag-text/20 bg-tag-text/[0.06]" />
          <span className="text-tag-dim">Flex</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 border border-tag-orange/25 bg-tag-orange/[0.06]" />
          <span className="text-tag-dim">Company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 border border-blue-400/20 bg-blue-400/[0.05]" />
          <span className="text-tag-dim">Meeting</span>
        </div>
      </div>

      {/* Blueprint */}
      <div className="relative overflow-hidden rounded border border-tag-dim/15 bg-tag-bg-deep/80">

        {/* Floor area */}
        <div className="relative p-4 md:p-6">
          {/* Room outline */}
          <div
            className="relative border border-tag-dim/15"
            style={{ aspectRatio: `${TOTAL_W} / ${TOTAL_H}` }}
          >
            {/* Corner marks */}
            <div className="absolute -left-px -top-px size-2.5 border-l-[1.5px] border-t-[1.5px] border-tag-dim/25" />
            <div className="absolute -right-px -top-px size-2.5 border-r-[1.5px] border-t-[1.5px] border-tag-dim/25" />
            <div className="absolute -bottom-px -left-px size-2.5 border-b-[1.5px] border-l-[1.5px] border-tag-dim/25" />
            <div className="absolute -bottom-px -right-px size-2.5 border-b-[1.5px] border-r-[1.5px] border-tag-dim/25" />

            {/* Entrance bottom center */}
            <div className="absolute -bottom-px left-1/2 flex -translate-x-1/2 flex-col items-center">
              <div className="h-px w-28 bg-tag-muted/50" />
              <div className="flex w-28 justify-between">
                <div className="h-1.5 border-l border-tag-muted/50" />
                <div className="h-1.5 border-r border-tag-muted/50" />
              </div>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-tag-muted">
                Entrance
              </span>
            </div>

            {/* Entrance right side */}
            <div className="absolute -right-px top-[24%] flex items-center">
              <span
                className="mr-1 font-mono text-[9px] uppercase tracking-[0.2em] text-tag-muted"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                Entrance
              </span>
              <div className="flex h-12 flex-col justify-between">
                <div className="w-1.5 border-t border-tag-muted/50" />
                <div className="w-1.5 border-b border-tag-muted/50" />
              </div>
              <div className="h-12 w-px bg-tag-muted/50" />
            </div>

            {/* Static zones (meeting room, TV corner, pool table) */}
            {staticZones.map((zone) => {
              const styles = staticStyles[zone.type as 'meeting' | 'amenity']
              const isHovered = hoveredStatic === zone.id
              const isVisible = loaded || visibleElements.has(zone.id)

              return (
                <div
                  key={zone.id}
                  onMouseEnter={() => setHoveredStatic(zone.id)}
                  onMouseLeave={() => setHoveredStatic(null)}
                  className={cn(
                    'absolute flex cursor-default items-center justify-center border transition-all',
                    styles.base,
                    isHovered && styles.hover,
                    isVisible
                      ? 'opacity-100 duration-150'
                      : 'translate-x-[4px] skew-x-[-2deg] scale-[1.02] opacity-0 duration-75'
                  )}
                  style={{
                    left: `${(zone.x / TOTAL_W) * 100}%`,
                    top: `${(zone.y / TOTAL_H) * 100}%`,
                    width: `${(zone.w / TOTAL_W) * 100}%`,
                    height: `${(zone.h / TOTAL_H) * 100}%`,
                  }}
                >
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 md:text-xs',
                      styles.label,
                      isHovered && styles.labelHover
                    )}
                  >
                    {zone.label}
                  </span>
                </div>
              )
            })}

            {/* Desk clusters */}
            {deskClusters.map((cluster) => {
              const styles = clusterStyles[cluster.type as 'flex' | 'company']
              const isClusterHovered = hoveredCluster === cluster.id
              const isVisible = loaded || visibleElements.has(cluster.id)

              return (
                <div
                  key={cluster.id}
                  className={cn(
                    'absolute flex flex-col border transition-all',
                    styles.zone,
                    isClusterHovered && styles.zoneHover,
                    isVisible
                      ? 'opacity-100 duration-150'
                      : '-translate-y-[4px] skew-y-[2deg] scale-[0.97] opacity-0 duration-75'
                  )}
                  style={{
                    left: `${(cluster.x / TOTAL_W) * 100}%`,
                    top: `${(cluster.y / TOTAL_H) * 100}%`,
                    width: `${(cluster.w / TOTAL_W) * 100}%`,
                    height: `${(cluster.h / TOTAL_H) * 100}%`,
                  }}
                >
                  {/* Cluster label */}
                  <div
                    className={cn(
                      'px-1.5 pt-1 font-mono text-[7px] uppercase tracking-[0.2em] transition-colors duration-300 md:text-[8px]',
                      styles.label,
                      isClusterHovered && styles.labelHover
                    )}
                  >
                    {cluster.label}
                  </div>

                  {/* Desk grid */}
                  <div
                    className={cn(
                      'grid flex-1 gap-[3px] p-1.5 md:gap-1 md:p-2',
                      cluster.id === 'A' || cluster.id === 'B' || cluster.id === 'C'
                        ? 'grid-cols-2 grid-rows-3'
                        : cluster.id === 'E'
                          ? 'grid-cols-3'
                          : cluster.desks.length > 4 && cluster.desks.length % 3 === 0
                            ? 'grid-cols-2'
                            : cluster.desks.length > 4
                              ? 'grid-cols-3'
                              : 'grid-cols-2'
                    )}
                  >
                    {cluster.desks.map((desk, i) => {
                      const isDeskHovered = hoveredDesk?.id === desk.id
                      const span =
                        (cluster.id === 'A' && (i === 0 || i === 3)) ||
                        ((cluster.id === 'B' || cluster.id === 'C') && i === 0)

                      return (
                        <div
                          key={desk.id}
                          onMouseEnter={() => {
                            setHoveredDesk(desk)
                            setLastDesk(desk)
                            setHoveredCluster(cluster.id)
                          }}
                          onMouseLeave={() => {
                            setHoveredDesk(null)
                            setHoveredCluster(null)
                          }}
                          className={cn(
                            'flex cursor-default items-center justify-center border font-mono text-[9px] transition-all duration-200 md:text-[10px]',
                            styles.desk,
                            (isDeskHovered || isClusterHovered) && styles.deskHover,
                            span && 'col-span-2'
                          )}
                        >
                          {desk.id}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hover tooltip */}
        <div
          className={cn(
            'absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-200',
            hoveredDesk ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          )}
        >
          <div className="flex items-center gap-3 rounded border border-tag-dim/20 bg-tag-bg/95 px-4 py-2 font-mono text-xs shadow-2xl backdrop-blur-sm">
            <span className="uppercase tracking-wider text-tag-dim">
              Desk {displayDesk?.id}
            </span>
            <div className="h-3 w-px bg-tag-dim/20" />
            <span
              className={cn(
                displayDesk?.type === 'company' ? 'text-tag-orange' : 'text-tag-text'
              )}
            >
              {displayDesk?.company ?? 'Flex workspace'}
            </span>
            <div
              className={cn(
                'size-1.5 rounded-full',
                displayDesk?.type === 'company' ? 'bg-tag-orange' : 'bg-emerald-500'
              )}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim/40">
        <span>TAG — Floor plan</span>
        <div className="flex gap-6">
          <span>
            <span className="text-tag-text/60">26</span> flex
          </span>
          <span>
            <span className="text-tag-orange/60">8</span> reserved
          </span>
        </div>
        <span>Rev. 02</span>
      </div>
    </div>
  )
}
