import { cn } from '@lib/utils'

interface InfoCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export const InfoCard = ({ title, description, icon, className }: InfoCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-tag-border bg-tag-card p-5 transition-colors hover:border-tag-dim',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-tag-orange">{icon}</div>}
        <div>
          <h3 className="font-medium text-tag-text">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-tag-muted">{description}</p>
        </div>
      </div>
    </div>
  )
}
