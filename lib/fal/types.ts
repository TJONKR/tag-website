// ─── Image Generation ────────────────────────────────────────────

export interface GenerateImagesInput {
  prompt: string
  num_images?: number
  image_size?:
    | 'square_hd'
    | 'square'
    | 'landscape_4_3'
    | 'landscape_16_9'
    | 'portrait_4_3'
    | 'portrait_16_9'
}

export interface FalImage {
  url: string
  width: number
  height: number
  content_type: string
}

export interface GenerateImagesOutput {
  images: FalImage[]
  seed: number
  prompt: string
}

// ─── Video Generation ────────────────────────────────────────────

export interface GenerateVideoInput {
  prompt: string
  aspect_ratio?: '16:9' | '9:16'
  duration?: '4s' | '6s' | '8s'
  resolution?: '720p' | '1080p'
  generate_audio?: boolean
}

export interface FalVideo {
  url: string
  content_type: string
  file_name: string
  file_size: number
}

export interface GenerateVideoOutput {
  video: FalVideo
}

// ─── 3D Model Generation ────────────────────────────────────────

export interface GenerateModel3dInput {
  prompt: string
  texture?: 'no' | 'standard' | 'HD'
  pbr?: boolean
  auto_size?: boolean
  face_limit?: number
  negative_prompt?: string
}

export interface GenerateModel3dFromImageInput {
  image_url: string
  texture?: 'no' | 'standard' | 'HD'
  pbr?: boolean
  auto_size?: boolean
  face_limit?: number
}

export interface FalFile {
  url: string
  content_type: string
  file_name: string
  file_size: number
}

export interface GenerateModel3dOutput {
  task_id: string
  model_mesh: FalFile
  rendered_image: FalFile
  base_model?: FalFile
  pbr_model?: FalFile
}
