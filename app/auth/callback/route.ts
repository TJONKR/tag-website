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
      console.log('[auth/callback] session established for:', data.user?.id)
      return response
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
  }

  // If something went wrong, send to forgot-password with an error hint
  return NextResponse.redirect(`${origin}/forgot-password?error=invalid_link`)
}
