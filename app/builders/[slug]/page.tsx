import { permanentRedirect } from 'next/navigation'

interface BuilderPageProps {
  params: Promise<{ slug: string }>
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { slug } = await params
  permanentRedirect(`/profile/${slug}`)
}
