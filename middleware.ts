import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Auth disabled - all routes are public for now
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
