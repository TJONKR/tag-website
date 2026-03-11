'use server'

import { createServerSupabaseClient } from '@lib/db'

import { insertContract } from './mutations'
import { generateContractPdf } from './pdf'
import { CONTRACT_VERSION } from './contract-template'

export async function signContract(): Promise<{ status: 'success' | 'failed' }> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const signedAt = new Date()

    // Generate PDF
    const pdfBuffer = await generateContractPdf(
      profile?.name ?? '',
      user.email ?? '',
      signedAt
    )

    // Upload to Supabase Storage
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

    await insertContract(user.id, CONTRACT_VERSION, uploadError ? undefined : publicUrl)

    return { status: 'success' }
  } catch (error) {
    console.error('signContract error:', error)
    return { status: 'failed' }
  }
}
