interface TypeSpecimenProps {
  name: string
  role: string
  weights: string
  className: string
  sample: string
}

export const TypeSpecimen = ({ name, role, weights, className, sample }: TypeSpecimenProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-tag-border bg-tag-bg-deep p-6">
      <div className="flex items-baseline justify-between gap-4 border-b border-tag-border pb-3">
        <div className="flex flex-col">
          <span className="font-syne text-lg text-tag-text">{name}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-tag-dim">
            {role}
          </span>
        </div>
        <span className="font-mono text-[11px] text-tag-muted">{weights}</span>
      </div>
      <p className={`text-tag-text ${className}`}>{sample}</p>
    </div>
  )
}
