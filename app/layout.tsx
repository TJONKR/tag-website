import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Funnel_Display } from 'next/font/google'
import { ThemeProvider } from '@components/theme-provider'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aiambuilders.com'),
  title: 'AI.AM Builders',
  description:
    'AI Amsterdam Builders is a community that brings together top AI creators and builders to collaborate, share knowledge, and build high-level AI solutions.',
  icons: {
    icon: '/images/Subtract.svg',
    apple: '/images/Subtract.svg',
  },
}

export const viewport = {
  maximumScale: 1,
}

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-funnel-display',
  weight: ['400', '500', '600', '700'],
})

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)'
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)'
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${funnelDisplay.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
