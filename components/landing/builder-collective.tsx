'use client'

import { ArrowUpRight } from 'lucide-react'

import { Logo } from './logo'

interface Member {
  id: string
  name: string
  imageUrl?: string
  link?: string
}

const members: Member[] = [
  { id: '1', name: 'Boris de Wit', link: '#' },
  { id: '2', name: 'Caeser Schoorl', link: '#' },
  { id: '3', name: 'Kevin Muiser', link: '#' },
  { id: '4', name: 'Maarten Mulder', link: '#' },
  { id: '5', name: 'Pieter de Groot', link: '#' },
  { id: '6', name: 'Thomas van Berg', link: '#' },
]

export const BuilderCollective = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          The Builder Collective
        </h2>

        {/* Description */}
        <p className="mt-6 text-muted-foreground">
          AI Amsterdam Builders is a community and platform. It brings together AI creators,
          creative content creators, developers, and data scientists to build AI solutions at the
          highest level. With a strong culture of collaboration, knowledge sharing, and creativity,
          members work on projects, events, and hackathons. The community provides access to a
          network of top AI professionals, a physical headquarters, partners, and an environment
          where innovation is central.
        </p>
      </div>

      {/* Community Members Section */}
      <div className="mt-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex items-center gap-2">
            <Logo className="size-4" />
            <span className="text-sm font-semibold uppercase tracking-wider text-red-500">
              Community
            </span>
          </div>
        </div>

        {/* Member Carousel */}
        <div className="mx-auto mt-6 max-w-5xl px-6">
          <div className="scrollbar-thin overflow-x-auto pb-4">
            <div className="flex gap-4">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="mx-auto mt-16 max-w-3xl px-6">
        <blockquote className="text-lg italic text-muted-foreground md:text-xl">
          &ldquo;We&apos;re the cultural layer underneath the startup ecosystem. To attract the
          obsessed, creative, talented people before they&apos;re ready for their next step.
          We&apos;re where the energy is.&rdquo;
        </blockquote>
      </div>
    </section>
  )
}

interface MemberCardProps {
  member: Member
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <a href={member.link} className="group block">
      {/* Member Photo Placeholder */}
      <div className="relative h-48 w-44 overflow-hidden rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center">
          <span className="text-xs text-muted-foreground">Photo</span>
        </div>
      </div>

      {/* Name */}
      <div className="mt-3 flex items-center gap-2">
        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          {member.name}
        </span>
      </div>
    </a>
  )
}
