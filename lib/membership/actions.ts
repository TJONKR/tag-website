'use server'

import { createServerSupabaseClient } from '@lib/db'

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
    return { status: 'success', data: claim }
  } catch (error) {
    console.error('submitAiAmClaim error:', error)
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to submit claim',
    }
  }
}
