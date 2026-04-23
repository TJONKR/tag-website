import { Badge } from '@components/ui/badge'

import type { IdeaStatus } from '../types'

const statusConfig: Record<IdeaStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-tag-text/10 text-tag-muted border-tag-border',
  },
  in_review: {
    label: 'In review',
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  planned: {
    label: 'Planned',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  done: {
    label: 'Done',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-tag-muted/10 text-tag-dim border-tag-border',
  },
}

interface StatusBadgeProps {
  status: IdeaStatus
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
