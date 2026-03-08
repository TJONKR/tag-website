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
import { getUpcomingEvents } from '@lib/events/queries'

export default async function HomePage() {
  const events = await getUpcomingEvents()

  return (
    <>
      <GrainOverlay />
      <main>
        <HeroVideo />
        <Manifesto />
        <Programs />
        <Quote />
        <Builders />
        <Events events={events} />
        <Cta />
        <Footer />
      </main>
    </>
  )
}
