import { fal } from '@fal-ai/client'

fal.config({
  credentials: process.env.FAL_KEY,
})

export { fal }

// ─── Model Endpoints ────────────────────────────────────────────

export const FAL_MODELS = {
  // Image generation
  image: {
    flux: 'fal-ai/flux/dev',
    fluxSchnell: 'fal-ai/flux/schnell',
  },
  // Video generation
  video: {
    veo31: 'fal-ai/veo3.1',
    veo31ImageToVideo: 'fal-ai/veo3.1/image-to-video',
  },
  // 3D model generation
  model3d: {
    tripoTextTo3d: 'tripo3d/tripo/v2.5/text-to-3d',
    tripoImageTo3d: 'tripo3d/tripo/v2.5/image-to-3d',
  },
} as const
