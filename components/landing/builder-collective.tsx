'use client'

import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { Logo } from './logo'

interface Member {
  id: string
  name: string
  imageUrl?: string
  link?: string
}

const members: Member[] = [
  {
    id: '1',
    name: 'Boris de Wit',
    link: 'https://www.linkedin.com/in/boris-de-wit-5ab536200/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/C4E03AQE8whVggN6TBw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1622810728298?e=1770854400&v=beta&t=LdcmRJRg2Ry6ZkpXxznYjwb4IUlJE1MBpvLEHmOPVI8',
  },
  {
    id: '2',
    name: 'Caesar Schoorl',
    link: 'https://www.linkedin.com/in/caesar-schoorl-ai/',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQHiLLcQelBMnA/profile-displayphoto-crop_800_800/B4EZmV2VNXHIAM-/0/1759155672345?e=1770854400&v=beta&t=RAhQOPahKzu1amEIUqvjoe9HCv1rLe4ZxedTuT6wG7A'
  },
  {
    id: '3',
    name: 'Kevin Muiser',
    link: 'https://www.linkedin.com/in/kevinmuiser/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQHWgbYEC4erOQ/profile-displayphoto-crop_800_800/B4EZtS86dgJ4AI-/0/1766623263168?e=1770854400&v=beta&t=qwuSKPH9xVazW7g0mLiZ70dd79I1J7RE148u6K2J7Uk',
  },
  {
    id: '4',
    name: 'Pieter de Kroon',
    link: 'https://www.linkedin.com/in/pieterdekroon/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQFJPe9YcjgOiQ/profile-displayphoto-crop_800_800/B4EZk01hUVKYAI-/0/1757528074961?e=1770854400&v=beta&t=wh6QNB1DLPur242bQiu-FOOVcFFBtn80zLZNF-TaEBw',
  },
  {
    id: '5',
    name: 'Tim Robben',
    link: 'https://www.linkedin.com/in/tim-robben-153bb9205/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQEx4L8dN3iUOA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1698931988409?e=1770854400&v=beta&t=ml7Bc2SWj9VwRJrgPGNvYAkHfRCftlzShzuuuDmlro4',
  },
  {
    id: '6',
    name: 'Thomas van Berg',
  },
  {
    id: '7',
    name: 'Tijs Nieuwboer',
    link: 'https://www.linkedin.com/in/tijs-nieuwboer/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQGogsV55gYzUg/profile-displayphoto-crop_800_800/B4EZmu6Jp4KoAI-/0/1759576107724?e=1770854400&v=beta&t=EJrrHgWx53DrSpv3yY2SoRy7QDZB-IOOuEukkGe80Vk',
  },
  {
    id: '8',
    name: 'Thomas Termaat',
    link: 'https://www.linkedin.com/in/thomastermaat/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQHjXEaLEY8DHQ/profile-displayphoto-shrink_800_800/B4EZSyIFvzG0Ac-/0/1738155253330?e=1770854400&v=beta&t=BsVb5bKuB__MTJ7NsgwgkchSyQ_YzQT3TvHuorM2Bfs',
  },
  {
    id: '9',
    name: 'Maarten Mulder',
  },
  {
    id: '10',
    name: 'Bram van Rijen',
    link: 'https://www.linkedin.com/in/bram-van-rijen/',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4D03AQGdsS-3yj44Lw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1710343607594?e=1770854400&v=beta&t=ihOfREOr4syUGQ5l_CDfiKoIK3ddECGRoixX3QXrgbg',
  },
]

export const BuilderCollective = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h2 className="font-funnel text-4xl font-semibold leading-none text-[#1E1E1E] dark:text-white md:text-[48px]">
          The Builder Collective
        </h2>

        {/* Description */}
        <p className="mt-6 font-jakarta text-xl leading-[150%] text-[#757575] md:text-2xl">
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
            <span className="font-funnel text-base font-semibold uppercase text-[#FF3D44]">
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
        <blockquote className="font-jakarta text-xl italic leading-[150%] text-[#757575] md:text-2xl">
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
    <a href={member.link} target="_blank" rel="noopener noreferrer" className="group block shrink-0">
      {/* Member Photo */}
      <div className="relative h-48 w-44 overflow-hidden rounded-lg bg-muted">
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-xs text-muted-foreground">Photo</span>
          </div>
        )}
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
