interface PortalHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const PortalHeader = ({ title, description, actions }: PortalHeaderProps) => {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-syne text-3xl font-bold text-tag-text">{title}</h1>
        {description && <p className="mt-2 text-tag-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
