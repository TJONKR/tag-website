'use client'

import { useState } from 'react'
import { ExternalLink, Eye, EyeOff, Loader2, Pencil } from 'lucide-react'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'
import { FadeIn } from '@lib/portal/components'
import { SocialLinks } from '@lib/auth/components/social-links'
import { EditProfileForm } from '@lib/auth/components/edit-profile-form'
import { useBuilderProfile } from '@lib/taste/hooks'
import {
  BioDialog,
  HeadlineDialog,
  KeyLinksDialog,
  ProjectsDialog,
  StringListDialog,
} from '@lib/taste/components'

import type { BuilderProfile, VisibilityField } from '@lib/taste/types'
import type { OnboardingProfile } from '@lib/onboarding/types'

type EditTarget =
  | 'headline'
  | 'bio'
  | 'tags'
  | 'projects'
  | 'interests'
  | 'notable_work'
  | 'influences'
  | 'key_links'
  | null

interface ProfileIdentityTabProps {
  onboardingProfile: OnboardingProfile
  initialBuilderProfile: BuilderProfile | null
  publicSlug: string | null
}

export const ProfileIdentityTab = ({
  onboardingProfile,
  initialBuilderProfile,
  publicSlug,
}: ProfileIdentityTabProps) => {
  const { profile: liveBuilderProfile, mutate } = useBuilderProfile()
  const builderProfile = liveBuilderProfile ?? initialBuilderProfile

  const [updating, setUpdating] = useState<VisibilityField | null>(null)
  const [editing, setEditing] = useState<EditTarget>(null)
  const closeEditor = () => setEditing(null)
  const onSaved = () => {
    mutate()
    setEditing(null)
  }

  const handleToggle = async (field: VisibilityField, nextValue: boolean) => {
    setUpdating(field)
    try {
      const res = await fetch('/api/taste/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: nextValue }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast({
          type: 'error',
          description: json.errors?.[0]?.message ?? 'Could not update visibility.',
        })
        return
      }
      mutate()
    } catch {
      toast({ type: 'error', description: 'Could not update visibility.' })
    } finally {
      setUpdating(null)
    }
  }

  const isComplete = builderProfile?.status === 'complete'
  const isInProgress =
    !builderProfile ||
    builderProfile.status === 'pending' ||
    builderProfile.status === 'researching' ||
    builderProfile.status === 'formatting' ||
    builderProfile.status === 'generating_skin'
  const hasError = builderProfile?.status === 'error'

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
      {/* ── LEFT: unified field list ── */}
      <div className="max-w-2xl space-y-5">
        <FadeIn>
          <div className="rounded-lg border border-tag-border bg-tag-card p-5">
            <h3 className="font-syne text-base font-bold text-tag-text">
              This is what others see
            </h3>
            <p className="mt-1 text-sm text-tag-muted">
              Everything here appears on your public profile. Use the eye
              toggle to hide a section.
            </p>
            {publicSlug && (
              <a
                href={`/profile/${publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-tag-muted transition-colors hover:text-tag-orange"
              >
                View public profile
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </FadeIn>

        {/* First-run / in-progress banner */}
        {isInProgress && (
          <FadeIn delay={50}>
            <div className="flex items-center gap-4 rounded-lg border border-tag-orange/30 bg-gradient-to-br from-tag-orange/10 to-tag-orange/[0.02] p-5">
              <Loader2 className="size-6 shrink-0 animate-spin text-tag-orange" />
              <div>
                <p className="font-syne text-sm font-bold text-tag-text">
                  Building your profile…
                </p>
                <p className="mt-1 text-xs text-tag-muted">
                  We&apos;re researching your public presence to fill out bio,
                  tags and projects. Usually takes a minute.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {hasError && (
          <FadeIn delay={50}>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
              <p className="font-syne text-sm font-bold text-destructive">
                Profile generation failed
              </p>
              <p className="mt-1 text-xs text-tag-muted">
                {builderProfile?.error ??
                  'Something went wrong generating your profile. An admin can retry this for you.'}
              </p>
            </div>
          </FadeIn>
        )}

        {/* Socials */}
        <FadeIn delay={100}>
          <SocialLinks
            profile={{
              linkedin_url: onboardingProfile.linkedin_url,
              twitter_url: onboardingProfile.twitter_url,
              github_url: onboardingProfile.github_url,
              website_url: onboardingProfile.website_url,
              instagram_url: onboardingProfile.instagram_url,
            }}
          />
        </FadeIn>

        {/* Building + Why TAG (user-editable) */}
        <FadeIn delay={150}>
          <EditProfileForm
            profile={{
              building: onboardingProfile.building,
              why_tag: onboardingProfile.why_tag,
            }}
          />
        </FadeIn>

        {/* Skeletons during first-run — preview of what's coming */}
        {isInProgress && (
          <>
            <SkeletonCard title="Headline" lines={['90%', '50%']} />
            <SkeletonCard title="Bio" lines={['95%', '95%', '70%', '95%', '50%']} />
            <SkeletonCard title="Tags" lines={['60%']} />
            <SkeletonCard title="Projects" lines={['70%', '95%', '50%']} />
          </>
        )}

        {/* AI sections — visibility only in v1 */}
        {isComplete && builderProfile?.headline && (
          <FieldCard
            title="Headline"
            show={builderProfile.show_headline}
            onToggle={(v) => handleToggle('show_headline', v)}
            isUpdating={updating === 'show_headline'}
            onEdit={() => setEditing('headline')}
          >
            <p className="font-syne text-lg font-semibold text-tag-text">
              {builderProfile.headline}
            </p>
          </FieldCard>
        )}

        {isComplete && builderProfile?.bio && (
          <FieldCard
            title="Bio"
            show={builderProfile.show_bio}
            onToggle={(v) => handleToggle('show_bio', v)}
            isUpdating={updating === 'show_bio'}
            onEdit={() => setEditing('bio')}
          >
            <div className="space-y-2 text-sm leading-relaxed text-tag-muted">
              {builderProfile.bio.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </FieldCard>
        )}

        {isComplete && builderProfile?.tags && builderProfile.tags.length > 0 && (
          <FieldCard
            title="Tags"
            show={builderProfile.show_tags}
            onToggle={(v) => handleToggle('show_tags', v)}
            isUpdating={updating === 'show_tags'}
            onEdit={() => setEditing('tags')}
          >
            <div className="flex flex-wrap gap-1.5">
              {builderProfile.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-2.5 py-0.5 text-sm text-tag-orange"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FieldCard>
        )}

        {isComplete &&
          builderProfile?.projects &&
          builderProfile.projects.length > 0 && (
            <FieldCard
              title="Projects"
              show={builderProfile.show_projects}
              onToggle={(v) => handleToggle('show_projects', v)}
              isUpdating={updating === 'show_projects'}
              onEdit={() => setEditing('projects')}
            >
              <div className="space-y-3">
                {builderProfile.projects.map((project, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <span className="font-syne text-sm font-medium text-tag-text">
                        {project.name}
                      </span>
                      {project.role && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-tag-dim">
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
                    <p className="mt-0.5 text-sm text-tag-muted">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </FieldCard>
          )}

        {isComplete &&
          builderProfile?.interests &&
          builderProfile.interests.length > 0 && (
            <FieldCard
              title="Interests"
              show={builderProfile.show_interests}
              onToggle={(v) => handleToggle('show_interests', v)}
              isUpdating={updating === 'show_interests'}
              onEdit={() => setEditing('interests')}
            >
              <div className="flex flex-wrap gap-1.5">
                {builderProfile.interests.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-tag-border bg-tag-bg px-2.5 py-0.5 text-sm text-tag-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FieldCard>
          )}

        {isComplete &&
          builderProfile?.notable_work &&
          builderProfile.notable_work.length > 0 && (
            <FieldCard
              title="Notable work"
              show={builderProfile.show_notable_work}
              onToggle={(v) => handleToggle('show_notable_work', v)}
              isUpdating={updating === 'show_notable_work'}
              onEdit={() => setEditing('notable_work')}
            >
              <ul className="space-y-1.5">
                {builderProfile.notable_work.map((work, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-tag-muted"
                  >
                    <span className="mt-1 text-tag-orange">•</span>
                    <span>{work}</span>
                  </li>
                ))}
              </ul>
            </FieldCard>
          )}

        {isComplete &&
          builderProfile?.influences &&
          builderProfile.influences.length > 0 && (
            <FieldCard
              title="Influences"
              show={builderProfile.show_influences}
              onToggle={(v) => handleToggle('show_influences', v)}
              isUpdating={updating === 'show_influences'}
              onEdit={() => setEditing('influences')}
            >
              <div className="flex flex-wrap gap-1.5">
                {builderProfile.influences.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-tag-border bg-tag-bg px-2.5 py-0.5 text-sm text-tag-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FieldCard>
          )}

        {isComplete &&
          builderProfile?.key_links &&
          builderProfile.key_links.length > 0 && (
            <FieldCard
              title="Links"
              show={builderProfile.show_key_links}
              onToggle={(v) => handleToggle('show_key_links', v)}
              isUpdating={updating === 'show_key_links'}
              onEdit={() => setEditing('key_links')}
            >
              <div>
                {builderProfile.key_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border-t border-t-tag-border py-2 text-sm text-tag-muted transition-colors first:border-t-0 hover:text-tag-orange"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{link.title}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-tag-dim">
                      {link.type}
                    </span>
                  </a>
                ))}
              </div>
            </FieldCard>
          )}
      </div>

      {/* ── RIGHT: visibility summary (sticky) ── */}
      {isComplete && builderProfile && (
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-tag-border bg-tag-card p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
              Public visibility
            </h3>
            <p className="mt-1 text-xs text-tag-muted">
              Toggle what shows on your public profile.
            </p>
            <div className="mt-3 space-y-0.5">
              {VISIBILITY_OPTIONS.map(({ field, label }) => {
                const isOn = builderProfile[field]
                const disabled = updating === field
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleToggle(field, !isOn)}
                    disabled={disabled}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                      isOn
                        ? 'bg-tag-orange/5 text-tag-text'
                        : 'bg-transparent text-tag-dim',
                      disabled && 'opacity-50'
                    )}
                  >
                    <span>{label}</span>
                    {isOn ? (
                      <Eye className="size-4 text-tag-orange" />
                    ) : (
                      <EyeOff className="size-4 text-tag-dim" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit dialogs ── */}
      <HeadlineDialog
        open={editing === 'headline'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        initialValue={builderProfile?.headline ?? null}
      />
      <BioDialog
        open={editing === 'bio'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        initialValue={builderProfile?.bio ?? null}
      />
      <StringListDialog
        open={editing === 'tags'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        field="tags"
        title="Tags"
        description="Short labels that describe what you do."
        placeholder="AI&#10;Design&#10;Next.js"
        initialValue={builderProfile?.tags ?? null}
      />
      <StringListDialog
        open={editing === 'interests'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        field="interests"
        title="Interests"
        description="Topics, curiosities, rabbit holes."
        placeholder="agents&#10;type design&#10;skateboarding"
        initialValue={builderProfile?.interests ?? null}
      />
      <StringListDialog
        open={editing === 'notable_work'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        field="notable_work"
        title="Notable work"
        description="Highlights — ships, wins, recognitions."
        placeholder="Shipped Lerai v1&#10;Wrote the Syne experiment"
        initialValue={builderProfile?.notable_work ?? null}
      />
      <StringListDialog
        open={editing === 'influences'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        field="influences"
        title="Influences"
        description="People, books, movements that shape your work."
        placeholder="Andy Matuschak&#10;Bret Victor"
        initialValue={builderProfile?.influences ?? null}
      />
      <ProjectsDialog
        open={editing === 'projects'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        initialValue={builderProfile?.projects ?? null}
      />
      <KeyLinksDialog
        open={editing === 'key_links'}
        onOpenChange={(o) => !o && closeEditor()}
        onSaved={onSaved}
        initialValue={builderProfile?.key_links ?? null}
      />
    </div>
  )
}

const VISIBILITY_OPTIONS: { field: VisibilityField; label: string }[] = [
  { field: 'show_headline', label: 'Headline' },
  { field: 'show_bio', label: 'Bio' },
  { field: 'show_tags', label: 'Tags' },
  { field: 'show_projects', label: 'Projects' },
  { field: 'show_interests', label: 'Interests' },
  { field: 'show_notable_work', label: 'Notable work' },
  { field: 'show_influences', label: 'Influences' },
  { field: 'show_key_links', label: 'Links' },
]

interface FieldCardProps {
  title: string
  show: boolean
  onToggle: (next: boolean) => void | Promise<void>
  isUpdating: boolean
  onEdit?: () => void
  children: React.ReactNode
}

const SkeletonCard = ({
  title,
  lines,
}: {
  title: string
  lines: string[]
}) => (
  <div className="rounded-lg border border-tag-border bg-tag-card p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
        {title}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-tag-dim">
        Generating…
      </span>
    </div>
    <div className="space-y-2">
      {lines.map((width, i) => (
        <div key={i} className="skeleton-bar" style={{ width }} />
      ))}
    </div>
  </div>
)

const FieldCard = ({
  title,
  show,
  onToggle,
  isUpdating,
  onEdit,
  children,
}: FieldCardProps) => (
  <div
    className={cn(
      'rounded-lg border border-tag-border bg-tag-card p-5 transition-opacity',
      !show && 'opacity-60'
    )}
  >
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
        {title}
        {!show && (
          <span className="ml-2 normal-case tracking-normal text-tag-dim">
            · not shown publicly
          </span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onToggle(!show)}
          disabled={isUpdating}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors',
            show
              ? 'border-tag-orange/35 bg-tag-orange/5 text-tag-orange'
              : 'border-tag-border text-tag-dim',
            isUpdating && 'opacity-50'
          )}
        >
          {show ? (
            <>
              <Eye className="size-3" /> Public
            </>
          ) : (
            <>
              <EyeOff className="size-3" /> Hidden
            </>
          )}
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title.toLowerCase()}`}
            className="flex items-center gap-1.5 rounded-full border border-tag-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-tag-muted transition-colors hover:border-tag-orange/35 hover:text-tag-orange"
          >
            <Pencil className="size-3" /> Edit
          </button>
        )}
      </div>
    </div>
    {children}
  </div>
)
