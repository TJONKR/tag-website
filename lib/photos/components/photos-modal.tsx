'use client'

import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'

import type { UserPhoto } from '../types'
import { PhotoUpload } from './photo-upload'

interface PhotosModalProps {
  trigger: ReactNode
  photos: UserPhoto[]
  photoUrls: Record<string, string>
}

export const PhotosModal = ({ trigger, photos, photoUrls }: PhotosModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne">Reference Photos</DialogTitle>
        </DialogHeader>
        <PhotoUpload initialPhotos={photos} photoUrls={photoUrls} context="lootbox" />
      </DialogContent>
    </Dialog>
  )
}
