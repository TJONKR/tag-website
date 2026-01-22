import {
  Header,
  Hero,
  CoworkingSpace,
  BuilderCollective,
  JoinUs,
  Footer,
} from '@components/landing'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CoworkingSpace />
        <BuilderCollective />
        <JoinUs />
      </main>
      <Footer />
    </div>
  )
}
