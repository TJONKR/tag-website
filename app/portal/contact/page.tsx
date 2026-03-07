import { Hash, User } from 'lucide-react'

import { PortalHeader } from '@lib/portal/components'
import { communityManagers } from '@lib/portal/data'

export default function ContactPage() {
  return (
    <>
      <PortalHeader
        title="Contact & Support"
        description="We're a community on location — we prefer face-to-face contact above all. Of course, sometimes you have a specific question and no one is around. That's why you can find the details below on how to reach us."
      />

      <div className="rounded-lg border border-tag-border bg-tag-card p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-tag-orange">
            <Hash className="size-4" />
          </div>
          <div>
            <h3 className="font-medium text-tag-text">Slack</h3>
            <p className="mt-1 text-sm leading-relaxed text-tag-muted">
              We use Slack for general communication. Ask a community manager to add you to our
              workspace.
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-syne text-xl font-bold text-tag-text">
        Community Managers
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {communityManagers.map((manager) => (
          <div
            key={manager.name}
            className="flex items-center gap-3 rounded-lg border border-tag-border bg-tag-card p-4"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-tag-orange/10">
              <User className="size-4 text-tag-orange" />
            </div>
            <span className="font-medium text-tag-text">{manager.name}</span>
          </div>
        ))}
      </div>
    </>
  )
}
