import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getBuilderProfile } from '@lib/taste/queries'
import { startProphecyDraw } from '@lib/taste/mutations'
import { generateProphecyRound } from '@lib/taste/pipeline/prophecy'
import { attachImages } from '@lib/taste/pipeline/prophecy-image'

import type { ProphecyRound } from '@lib/taste/types'

export const maxDuration = 60

const REDRAW_WINDOW_DAYS = 60

interface DrawBody {
  userId?: string
}

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as DrawBody
    const targetUserId = body.userId ?? user.id
    const isSelf = targetUserId === user.id

    if (!isSelf && !user.is_super_admin) {
      return NextResponse.json({ errors: [{ message: 'Forbidden' }] }, { status: 403 })
    }

    const profile = await getBuilderProfile(targetUserId)
    if (!profile || profile.status !== 'complete') {
      return NextResponse.json(
        { errors: [{ message: 'Builder profile must be complete before drawing a prophecy' }] },
        { status: 400 }
      )
    }

    // 60-day redraw gate — only after a prior prophecy has been sealed.
    // Super admins bypass. A half-finished draw (rounds exist but chosen
    // is null) is always allowed to restart.
    if (isSelf && !user.is_super_admin && profile.prophecy_drawn_at) {
      const drawnAt = new Date(profile.prophecy_drawn_at).getTime()
      const elapsedDays = (Date.now() - drawnAt) / (1000 * 60 * 60 * 24)
      if (elapsedDays < REDRAW_WINDOW_DAYS) {
        const daysLeft = Math.ceil(REDRAW_WINDOW_DAYS - elapsedDays)
        return NextResponse.json(
          {
            errors: [
              {
                message: `Redraw available in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
              },
            ],
          },
          { status: 403 }
        )
      }
    }

    // Fast path: pipeline pre-generates round 1 at signup. If that
    // pre-gen landed and the draw hasn't started yet (single unsealed
    // round 1, no chosen), return it as-is instead of regenerating.
    const existingRounds = profile.prophecy_rounds ?? []
    const canReuse =
      !profile.prophecy_chosen &&
      existingRounds.length === 1 &&
      existingRounds[0].picked_id === null &&
      existingRounds[0].cards.length === 4
    if (canReuse) {
      return NextResponse.json({
        ok: true,
        round: existingRounds[0],
        roundIndex: 1,
        reused: true,
      })
    }

    const name = profile.input_name ?? 'Member'
    const profileInput = {
      headline: profile.headline,
      bio: profile.bio,
      tags: profile.tags,
      projects: profile.projects,
      interests: profile.interests,
      notable_work: profile.notable_work,
      influences: profile.influences,
      key_links: profile.key_links,
    }

    const drafts = await generateProphecyRound(name, profileInput, [], 1)
    const cards = await attachImages(targetUserId, drafts)
    const firstRound: ProphecyRound = { cards, picked_id: null }
    await startProphecyDraw(targetUserId, firstRound)

    return NextResponse.json({ ok: true, round: firstRound, roundIndex: 1 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/prophecy/draw] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
