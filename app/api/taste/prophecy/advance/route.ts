import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getBuilderProfile } from '@lib/taste/queries'
import { saveProphecyRounds, sealProphecy } from '@lib/taste/mutations'
import { generateProphecyRound } from '@lib/taste/pipeline/prophecy'
import { attachImages } from '@lib/taste/pipeline/prophecy-image'
import { prophecyAdvanceSchema } from '@lib/taste/schema'

import type {
  ProphecyCard,
  ProphecyRound,
  ProphecyRoundIndex,
  ProphecyRounds,
} from '@lib/taste/types'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = prophecyAdvanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
    }

    const profile = await getBuilderProfile(user.id)
    if (!profile) {
      return NextResponse.json(
        { errors: [{ message: 'Profile not found' }] },
        { status: 404 }
      )
    }

    const rounds = (profile.prophecy_rounds ?? []) as ProphecyRounds
    if (rounds.length === 0) {
      return NextResponse.json(
        { errors: [{ message: 'No prophecy in progress. Draw first.' }] },
        { status: 400 }
      )
    }

    const currentIndex = rounds.length - 1
    const currentRound = rounds[currentIndex]
    if (currentRound.picked_id !== null) {
      return NextResponse.json(
        { errors: [{ message: 'This round is already sealed.' }] },
        { status: 400 }
      )
    }

    const pickedCard = currentRound.cards.find((c) => c.id === parsed.data.pickedCardId)
    if (!pickedCard) {
      return NextResponse.json(
        { errors: [{ message: 'Card not in current round.' }] },
        { status: 400 }
      )
    }

    // Commit the pick to the current round.
    const updatedRounds: ProphecyRounds = rounds.map((r, i) =>
      i === currentIndex ? { ...r, picked_id: pickedCard.id } : r
    )

    const roundJustSealed = (currentIndex + 1) as ProphecyRoundIndex

    // Round 3 sealed → finalise the prophecy.
    if (roundJustSealed === 3) {
      const chosen: ProphecyCard[] = updatedRounds.map((r) => {
        const c = r.cards.find((x) => x.id === r.picked_id)
        if (!c) throw new Error('Inconsistent rounds state')
        return c
      })
      await sealProphecy(user.id, updatedRounds, chosen)
      return NextResponse.json({
        ok: true,
        finalized: true,
        chosen,
        rounds: updatedRounds,
      })
    }

    // Otherwise: generate the next round conditioned on picks so far.
    const priorPicks: ProphecyCard[] = updatedRounds.map((r) => {
      const c = r.cards.find((x) => x.id === r.picked_id)
      if (!c) throw new Error('Inconsistent rounds state')
      return c
    })

    const nextIndex = (roundJustSealed + 1) as ProphecyRoundIndex
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

    const drafts = await generateProphecyRound(
      name,
      profileInput,
      priorPicks,
      nextIndex
    )
    const nextCards = await attachImages(user.id, drafts)
    const nextRound: ProphecyRound = { cards: nextCards, picked_id: null }
    const nextRounds: ProphecyRounds = [...updatedRounds, nextRound]

    await saveProphecyRounds(user.id, nextRounds)

    return NextResponse.json({
      ok: true,
      finalized: false,
      rounds: nextRounds,
      nextRoundIndex: nextIndex,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/prophecy/advance] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
