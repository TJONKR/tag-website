import { cn } from '@lib/utils'

const tickStyle = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, rgba(94,88,80,0.45) 0, rgba(94,88,80,0.45) 1px, transparent 1px, transparent 16px)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)',
  maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)',
}

interface SideRuleProps {
  side: 'left' | 'right'
}

const SideRule = ({ side }: SideRuleProps) => (
  <div
    className={cn(
      'absolute inset-y-0 flex',
      side === 'left' ? 'left-0 flex-row' : 'right-0 flex-row-reverse'
    )}
  >
    <div className="relative h-full w-px bg-gradient-to-b from-transparent via-tag-border to-transparent">
      <span className="absolute left-0 top-[18vh] h-4 w-2.5 -translate-x-1/2 bg-tag-orange" />
    </div>
    <div className="h-full w-2.5" style={tickStyle} />
  </div>
)

export const BrandGuides = () => (
  <>
    {/* Background grid pattern */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-tag-bg" />
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, rgba(155,149,137,0.10) 0, rgba(155,149,137,0.10) 1px, transparent 1px, transparent 112px)',
        backgroundPosition: 'center',
        WebkitMaskImage: 'radial-gradient(125% 80% at 50% 25%, black 35%, transparent 100%)',
        maskImage: 'radial-gradient(125% 80% at 50% 25%, black 35%, transparent 100%)',
      }}
    />
    {/* Side guideline rules */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 hidden px-8 md:block">
      <div className="relative h-full w-full">
        <SideRule side="left" />
        <SideRule side="right" />
      </div>
    </div>
  </>
)
