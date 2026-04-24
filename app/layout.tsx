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
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'TAG',
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
