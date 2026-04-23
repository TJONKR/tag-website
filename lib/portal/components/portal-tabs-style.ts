import { cn } from '@lib/utils'

export const PORTAL_TABS_LIST_CLASSES =
  'mb-8 h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-tag-border bg-transparent p-0'

export const PORTAL_TABS_TRIGGER_CLASSES = cn(
  '-mb-px shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-tag-muted shadow-none transition-colors',
  'hover:text-tag-text',
  'data-[state=active]:border-tag-orange data-[state=active]:bg-transparent data-[state=active]:text-tag-orange data-[state=active]:shadow-none'
)
