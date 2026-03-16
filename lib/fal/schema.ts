import { z } from 'zod'

export const generateImagesSchema = z.object({
  prompt: z.string().min(1).max(2000),
  num_images: z.number().int().min(1).max(4).optional().default(4),
  image_size: z
    .enum([
      'square_hd',
      'square',
      'landscape_4_3',
      'landscape_16_9',
      'portrait_4_3',
      'portrait_16_9',
    ])
    .optional()
    .default('square_hd'),
})

export const generateVideoSchema = z.object({
  prompt: z.string().min(1).max(2000),
  aspect_ratio: z.enum(['16:9', '9:16']).optional().default('16:9'),
  duration: z.enum(['4s', '6s', '8s']).optional().default('8s'),
  resolution: z.enum(['720p', '1080p']).optional().default('720p'),
  generate_audio: z.boolean().optional().default(true),
})

export const generateModel3dSchema = z.object({
  prompt: z.string().min(1).max(1024),
  texture: z.enum(['no', 'standard', 'HD']).optional().default('standard'),
  pbr: z.boolean().optional().default(false),
  auto_size: z.boolean().optional().default(false),
  face_limit: z.number().int().min(1000).max(500000).optional(),
  negative_prompt: z.string().max(255).optional(),
})

export const generateModel3dFromImageSchema = z.object({
  image_url: z.string().url(),
  texture: z.enum(['no', 'standard', 'HD']).optional().default('standard'),
  pbr: z.boolean().optional().default(false),
  auto_size: z.boolean().optional().default(false),
  face_limit: z.number().int().min(1000).max(500000).optional(),
})
