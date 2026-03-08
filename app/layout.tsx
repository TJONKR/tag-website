import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import { Syne, Space_Grotesk, Space_Mono } from 'next/font/google'

import { StickyNav } from '@components/navigation'
import { getOptionalUser } from '@lib/auth/queries'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aiambuilders.com'),
  title: 'TAG — To Achieve Greatness',
  description:
    'A community of builders, hackers, and creators in Amsterdam. We meet every week. We ship every month. We show what we built — then we do it again.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  maximumScale: 1,
}

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  weight: ['800'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
  weight: ['400', '500', '600'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '700'],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getOptionalUser()

  return (
    <html
      lang="en"
      className={`dark ${syne.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">
        <Toaster position="top-center" />
        <StickyNav isLoggedIn={!!user} />
        {children}
      </body>
    </html>
  )
}
