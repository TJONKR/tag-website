'use client'

import { useMyIdeas } from '../hooks'
import type { Idea, IdeaCategory } from '../types'

import { IdeaForm } from './idea-form'
import { StatusBadge } from './status-badge'

const categoryLabels: Record<IdeaCategory, string> = {
  event: 'Event',
  feature: 'Feature',
  community: 'Community',
  other: 'Other',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

interface IdeaListProps {
  initialIdeas: Idea[]
}

export const IdeaList = ({ initialIdeas }: IdeaListProps) => {
  const { ideas, mutate } = useMyIdeas(initialIdeas)

  return (
    <div className="space-y-10">
      <section className="rounded-lg border border-tag-border bg-tag-card p-6">
        <h2 className="mb-4 font-syne text-xl font-semibold text-tag-text">Drop an idea</h2>
        <IdeaForm onSubmitted={() => mutate()} />
      </section>

      <section>
        <h2 className="mb-4 font-syne text-xl font-semibold text-tag-text">Your ideas</h2>
        {ideas.length === 0 ? (
          <p className="py-8 text-center font-mono text-sm text-tag-dim">
            No ideas yet. Share the first one.
          </p>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="rounded-lg border border-tag-border bg-tag-card p-4 transition-colors hover:border-tag-orange/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-grotesk text-base font-medium text-tag-text">
                      {idea.title}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap font-grotesk text-sm text-tag-muted">
                      {idea.body}
                    </p>
                    {idea.admin_note && (
                      <p className="mt-2 rounded border border-tag-border/60 bg-tag-bg/40 p-2 font-mono text-xs text-tag-dim">
                        <span className="text-tag-orange">Admin note:</span> {idea.admin_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StatusBadge status={idea.status} />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-tag-dim">
                      {categoryLabels[idea.category]}
                    </span>
                  </div>
                </div>
                <p className="mt-3 font-mono text-xs text-tag-dim">{formatDate(idea.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
