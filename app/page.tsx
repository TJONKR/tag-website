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

export default function HomePage() {
  return (
    <>
      <GrainOverlay />
      <main>
        <HeroVideo />
        <Manifesto />
        <Programs />
        <Quote />
        <Builders />
        <Events />
        <Cta />
        <Footer />
      </main>
    </>
  )
}
