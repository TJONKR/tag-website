import { fal } from '@lib/fal/client'

/**
 * Generate a 3D model from a 2D image using Tripo via fal.ai SDK.
 */
export async function generate3dSkin(imageUrl: string): Promise<string> {
  const result = await fal.subscribe('tripo3d/tripo/v2.5/image-to-3d', {
    input: {
      image_url: imageUrl,
    },
    logs: true,
    pollInterval: 5000,
  })

  const modelUrl = (result.data as { model_mesh?: { url?: string } })?.model_mesh?.url
  if (!modelUrl) {
    throw new Error('3D generation failed: no model URL in response')
  }

  return modelUrl
}
