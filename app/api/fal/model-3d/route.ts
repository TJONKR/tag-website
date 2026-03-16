import { NextRequest, NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { fal, FAL_MODELS } from '@lib/fal/client'
import {
  generateModel3dSchema,
  generateModel3dFromImageSchema,
} from '@lib/fal/schema'
import type { GenerateModel3dOutput } from '@lib/fal/types'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const user = await getOptionalUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Determine if text-to-3D or image-to-3D based on input
  const isImageBased = 'image_url' in body

  const schema = isImageBased
    ? generateModel3dFromImageSchema
    : generateModel3dSchema
  const model = isImageBased
    ? FAL_MODELS.model3d.tripoImageTo3d
    : FAL_MODELS.model3d.tripoTextTo3d

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const result = await fal.subscribe(model, {
    input: parsed.data,
  })

  const data = result.data as GenerateModel3dOutput

  return NextResponse.json({
    task_id: data.task_id,
    model_mesh: data.model_mesh,
    rendered_image: data.rendered_image,
    base_model: data.base_model,
    pbr_model: data.pbr_model,
  })
}
