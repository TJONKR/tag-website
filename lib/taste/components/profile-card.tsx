'use client'

import { ExternalLink, Tag, Briefcase, Lightbulb, Award, BookOpen, Link2 } from 'lucide-react'

import type { BuilderProfile } from '../types'

interface ProfileCardProps {
  profile: BuilderProfile
}

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) => (
  <div className="rounded-xl border border-tag-border bg-tag-card p-6">
    <div className="mb-4 flex items-center gap-2">
      <Icon className="size-4 text-tag-orange" />
      <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-tag-text">
        {title}
      </h3>
    </div>
    {children}
  </div>
)

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="space-y-6">
      {/* Header: headline + bio */}
      <div className="rounded-xl border border-tag-border bg-tag-card p-8">
        {profile.headline && (
          <h2 className="font-syne text-2xl font-bold text-tag-text">
            {profile.headline}
          </h2>
        )}
        {profile.bio && (
          <div className="mt-4 space-y-3 text-tag-muted">
            {profile.bio.split('\n\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        {profile.data_sources && profile.data_sources.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.data_sources.map((source) => (
              <span
                key={source}
                className="rounded-full bg-tag-border px-2.5 py-0.5 font-mono text-xs uppercase text-tag-dim"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {profile.tags && profile.tags.length > 0 && (
        <Section title="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-3 py-1 text-sm text-tag-orange"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <Section title="Projects" icon={Briefcase}>
          <div className="space-y-4">
            {profile.projects.map((project, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-tag-text">
                    {project.name}
                  </span>
                  {project.role && (
                    <span className="font-mono text-xs text-tag-dim">
                      {project.role}
                    </span>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tag-orange hover:text-tag-orange/80"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-tag-muted">{project.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Section title="Interests" icon={Lightbulb}>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-tag-border px-3 py-1 text-sm text-tag-muted"
              >
                {interest}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Notable Work */}
      {profile.notable_work && profile.notable_work.length > 0 && (
        <Section title="Notable Work" icon={Award}>
          <ul className="space-y-2">
            {profile.notable_work.map((work, i) => (
              <li key={i} className="flex gap-2 text-sm text-tag-muted">
                <span className="mt-1 text-tag-orange">•</span>
                <span>{work}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Influences */}
      {profile.influences && profile.influences.length > 0 && (
        <Section title="Influences" icon={BookOpen}>
          <div className="flex flex-wrap gap-2">
            {profile.influences.map((influence) => (
              <span
                key={influence}
                className="rounded-full bg-tag-border px-3 py-1 text-sm text-tag-muted"
              >
                {influence}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Key Links */}
      {profile.key_links && profile.key_links.length > 0 && (
        <Section title="Links" icon={Link2}>
          <div className="space-y-2">
            {profile.key_links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-tag-muted transition-colors hover:text-tag-orange"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{link.title}</span>
                <span className="shrink-0 font-mono text-xs text-tag-dim">
                  {link.type}
                </span>
              </a>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
