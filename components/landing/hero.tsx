import { cn } from '@lib/utils'

export const Hero = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Text Content */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Where builders turn
            <br />
            AI into products
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            AI.AM Builders works from a shared office at AI Amsterdam.
            <br />
            We&apos;re builders using AI models to create products.
          </p>
        </div>
      </div>

      {/* Photo Grid - full width with overflow */}
      <div className="mt-16 overflow-hidden">
        <PhotoGrid />
      </div>
    </section>
  )
}

const PhotoGrid = () => {
  // Normal image height used across all columns
  const imageWidth = 'w-[300px]'

  return (
    <div className="relative flex items-start justify-center gap-5">
      {/* Column 1 - Single image, vertically centered, bleeds left */}
      <div className="hidden shrink-0 items-center self-center lg:flex">
        <PlaceholderImage
          className={`-ml-32 h-[448px] ${imageWidth} rounded-2xl`}
          label="Arcade"
        />
      </div>

      {/* Column 2 - Normal image on top, smaller (2/3) on bottom */}
      <div className="hidden shrink-0 flex-col gap-5 md:flex">
        <PlaceholderImage className={`h-[448px] ${imageWidth} rounded-2xl`} label="Meeting" />
        <PlaceholderImage className={`h-[288px] ${imageWidth} rounded-2xl`} label="Working" />
      </div>

      {/* Column 3 - Single image, vertically centered */}
      <div className="flex shrink-0 items-center self-center">
        <PlaceholderImage className={`h-[512px] ${imageWidth} rounded-2xl`} label="Office View" />
      </div>

      {/* Column 4 - Smaller (2/3) on top, normal image on bottom */}
      <div className="hidden shrink-0 flex-col gap-5 md:flex">
        <PlaceholderImage className={`h-[288px] ${imageWidth} rounded-2xl`} label="AI.AM Sign" />
        <PlaceholderImage className={`h-[448px] ${imageWidth} rounded-2xl`} label="Collectibles" />
      </div>

      {/* Column 5 - Single image, vertically centered, bleeds right */}
      <div className="hidden shrink-0 items-center self-center lg:flex">
        <PlaceholderImage
          className={`-mr-32 h-[448px] ${imageWidth} rounded-2xl`}
          label="Pool Table"
        />
      </div>
    </div>
  )
}

interface PlaceholderImageProps {
  className?: string
  label?: string
}

const PlaceholderImage = ({ className, label }: PlaceholderImageProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800',
        className
      )}
    >
      {label && (
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      )}
    </div>
  )
}
