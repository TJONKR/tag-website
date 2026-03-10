import {
  GrainOverlay,
  HeroVideo,
  Manifesto,
  Programs,
  Builders,
  Quote,
  Events,
  Cta,
  Footer,
} from '@components/landing'
import { getMemberCount } from '@lib/auth/queries'
import { getUpcomingEvents } from '@lib/events/queries'

export default async function HomePage() {
  const [events, memberCount] = await Promise.all([
    getUpcomingEvents(),
    getMemberCount(),
  ])

  return (
    <>
      <GrainOverlay />
      <main>
        <HeroVideo />
        <Manifesto />
        <Programs />
        <Quote />
        <Builders memberCount={memberCount} />
        <Events events={events} />
        <Cta />
        <Footer />
      </main>
    </>
  )
}
