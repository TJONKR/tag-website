interface PortalHeaderProps {
  title: string
  description?: string
}

export const PortalHeader = ({ title, description }: PortalHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="font-syne text-3xl font-bold text-tag-text">{title}</h1>
      {description && <p className="mt-2 text-tag-muted">{description}</p>}
    </div>
  )
}
