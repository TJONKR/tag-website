import { createServiceRoleClient } from '@lib/db'

import { updateSkinStatus, equipSkin } from '../mutations'
import type { GenerationType } from '../types'

import { generate2dSkin } from './generate-2d'
import { generate3dSkin } from './generate-3d'

interface PipelineInput {
  userId: string
  skinId: string
  styleId: string
  generationType: GenerationType
}

/**
 * Full generation pipeline:
 * 1. Fetch user photos (signed URLs)
 * 2. Get style prompt
 * 3. Generate 2D skin from best photo + prompt
 * 4. If rare (3d), also generate 3D model from 2D result
 * 5. Save results and auto-equip if first skin
 */
export async function runGenerationPipeline(input: PipelineInput) {
  const { userId, skinId, styleId, generationType } = input
  const supabase = createServiceRoleClient()

  try {
    // 1. Get user photos
    const { data: photos } = await supabase
      .from('user_photos')
      .select('storage_path')
      .eq('user_id', userId)

    if (!photos?.length) {
      throw new Error('No reference photos found')
    }

    // Pick a random reference photo so generations vary run-to-run
    const referencePhoto = photos[Math.floor(Math.random() * photos.length)]
    const { data: signedUrl } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(referencePhoto.storage_path, 3600)

    if (!signedUrl?.signedUrl) {
      throw new Error('Failed to get signed URL for photo')
    }

    // 2. Get style prompt
    const { data: style } = await supabase
      .from('lootbox_styles')
      .select('prompt')
      .eq('id', styleId)
      .single()

    if (!style) throw new Error('Style not found')

    // 3. Generate 2D skin
    const imageUrl = await generate2dSkin(signedUrl.signedUrl, style.prompt)

    // 4. If rare or epic (3d type), also generate 3D
    let model3dUrl: string | undefined
    if (generationType === '3d') {
      try {
        model3dUrl = await generate3dSkin(imageUrl)
      } catch (err) {
        console.error('[pipeline] 3D generation failed, keeping 2D result:', err)
      }
    }

    // 5. Save results
    await updateSkinStatus(skinId, 'complete', imageUrl, model3dUrl)

    // Auto-equip if this is the user's first skin
    const { count } = await supabase
      .from('user_skins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'complete')

    if ((count ?? 0) <= 1) {
      await equipSkin(userId, skinId)
    }
  } catch (error) {
    console.error('[pipeline] Generation failed:', error)
    await updateSkinStatus(skinId, 'error')
  }
}
