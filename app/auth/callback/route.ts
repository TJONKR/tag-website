import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/portal'

  console.log('[auth/callback] code:', code ? 'present' : 'missing', 'next:', next)
  console.log('[auth/callback] cookies:', request.cookies.getAll().map((c) => c.name))

  if (code) {
    const redirectUrl = `${origin}${next}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(
            cookiesToSet: {
              name: string
              value: string
              options: CookieOptions
            }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }

    // Show exchange error in browser for debugging
    const debugUrl = new URL(`${origin}/forgot-password`)
    debugUrl.searchParams.set('error', 'exchange_failed')
    debugUrl.searchParams.set('detail', error.message)
    return NextResponse.redirect(debugUrl.toString())
  }

  const cookieNames = request.cookies.getAll().map((c) => c.name).join(', ')
  const debugUrl = new URL(`${origin}/forgot-password`)
  debugUrl.searchParams.set('error', code ? 'exchange_not_reached' : 'no_code')
  debugUrl.searchParams.set('cookies', cookieNames)
  return NextResponse.redirect(debugUrl.toString())
}
