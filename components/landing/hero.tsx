import Image from 'next/image'

import { cn } from '@lib/utils'

export const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-[160px] bg-background px-4 pb-[140px] pt-[192px]">
      {/* Inner Content */}
      <div className="flex w-full max-w-[1240px] flex-col items-center justify-center gap-8">
        <h1 className="w-full text-center font-funnel text-5xl font-bold leading-tight text-[#1E1E1E] dark:text-white md:text-7xl lg:text-[96px] lg:leading-[120px]">
          Where builders turn
          <br />
          AI into products
        </h1>
        <p className="w-4/5 text-center font-jakarta text-xl leading-[150%] text-[#1E1E1E] dark:text-white/80 md:text-2xl lg:text-[32px]">
          AI.AM Builders works from a shared office at AI Amsterdam.
          We’re builders using AI models to create  products.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="w-full overflow-hidden">
        <PhotoGrid />
      </div>
    </section>
  )
}

const PhotoGrid = () => {
  return (
    <div className="relative flex items-center justify-center gap-[23.33px]">
      {/* Column 1 - Single image, vertically centered */}
      <div className="hidden shrink-0 lg:flex">
        <HeroImage
          src="/images/hero1.jpg"
          alt="Arcade"
          className="h-[448px] w-[300px]"
        />
      </div>

      {/* Column 2 - 448px on top, 288px on bottom */}
      <div className="hidden shrink-0 flex-col gap-6 md:flex">
        <HeroImage src="/images/hero2.jpg" alt="Meeting" className="h-[448px] w-[300px]" />
        <HeroImage src="/images/hero3.jpg" alt="Working" className="h-[288px] w-[300px]" />
      </div>

      {/* Column 3 - Single image, vertically centered */}
      <div className="flex shrink-0">
        <HeroImage src="/images/hero4.jpg" alt="Office View" className="h-[512px] w-[300px]" />
      </div>

      {/* Column 4 - 288px on top, 448px on bottom */}
      <div className="hidden shrink-0 flex-col gap-6 md:flex">
        <HeroImage src="/images/hero5.jpg" alt="AI.AM Sign" className="h-[288px] w-[300px]" />
        <HeroImage src="/images/hero6.jpg" alt="Collectibles" className="h-[448px] w-[300px]" />
      </div>

      {/* Column 5 - Single image, vertically centered */}
      <div className="hidden shrink-0 lg:flex">
        <HeroImage
          src="/images/hero7.jpg"
          alt="Pool Table"
          className="h-[448px] w-[300px]"
        />
      </div>
    </div>
  )
}

interface HeroImageProps {
  src: string
  alt: string
  className?: string
}

const HeroImage = ({ src, alt, className }: HeroImageProps) => {
  return (
    <div className={cn('overflow-hidden rounded-2xl', className)}>
      <Image
        src={src}
        alt={alt}
        width={300}
        height={512}
        className="size-full object-cover"
      />
    </div>
  )
}
