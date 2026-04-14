'use server'

import { createServerSupabaseClient } from '@lib/db'
import { sendClaimNewAdmin, sendClaimSubmitted, sendContractSigned } from '@lib/email/senders'

import { CONTRACT_VERSION } from './contract-template'
import { createAiAmClaim, insertContract } from './mutations'
import { generateContractPdf } from './pdf'
import { contractFieldsSchema, type ContractFieldsInput } from './schema'

type ActionResult<T = void> =
  | { status: 'success'; data?: T }
  | { status: 'failed'; error: string }

export async function signContract(
  fields: ContractFieldsInput
): Promise<ActionResult> {
  try {
    const parsed = contractFieldsSchema.safeParse(fields)
    if (!parsed.success) {
      return {
        status: 'failed',
        error: parsed.error.issues[0]?.message ?? 'Invalid contract fields',
      }
    }

    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed', error: 'Unauthorized' }

    const signedAt = new Date()

    const pdfBuffer = await generateContractPdf(parsed.data, user.email ?? '', signedAt)

    const path = `contracts/${user.id}/${CONTRACT_VERSION}-${signedAt.getTime()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(path, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Contract upload error:', uploadError.message)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('contracts').getPublicUrl(path)

    await insertContract(
      user.id,
      CONTRACT_VERSION,
      uploadError ? undefined : publicUrl,
      parsed.data
    )

    // Email the signer a copy of the PDF. Non-blocking — failures are logged
    // but won't fail the contract signing.
    if (user.email) {
      await sendContractSigned({
        to: user.email,
        representativeName: parsed.data.representativeName,
        companyName: parsed.data.companyName,
        signedOn: signedAt.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        pdf: pdfBuffer,
        filename: `tag-membership-${CONTRACT_VERSION}.pdf`,
      })
    }

    return { status: 'success' }
  } catch (error) {
    console.error('signContract error:', error)
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to sign contract',
    }
  }
}

export async function submitAiAmClaim(): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed', error: 'Unauthorized' }

    const claim = await createAiAmClaim(user.id)

    // Pull the user's display name from profiles for friendlier emails.
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    if (user.email) {
      await sendClaimSubmitted({ to: user.email, name: profile?.name ?? undefined })
    }
    if (user.email) {
      await sendClaimNewAdmin({
        userName: profile?.name ?? undefined,
        userEmail: user.email,
      })
    }

    return { status: 'success', data: claim }
  } catch (error) {
    console.error('submitAiAmClaim error:', error)
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to submit claim',
    }
  }
}
