'use client'

import { useScrollReveal } from '@hooks/use-scroll-reveal'

const programs = [
  { number: '01', label: 'The Space', image: '/images/program-space.png' },
  { number: '02', label: 'Events', image: '/images/program-events.jpg' },
  { number: '03', label: 'Ecosystem', image: '/images/program-ecosystem.jpg' },
]

export const Programs = () => {
  const ref = useScrollReveal()

  return (
    <section
      ref={ref}
      className="grid min-h-screen w-full grid-cols-2 grid-rows-2 max-md:grid-cols-1 max-md:grid-rows-none"
    >
      {programs.map((program, i) => (
        <div
          key={program.number}
          className="group reveal-scale relative flex min-h-[50vh] flex-col justify-between overflow-hidden border-2 border-tag-border p-10 max-md:min-h-[40vh]"
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${program.image})` }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-tag-bg/60" />
          {/* Orange glow on hover */}
          <div className="absolute inset-0 opacity-0 shadow-[0_0_30px_rgba(255,95,31,0.15)_inset] transition-opacity duration-300 group-hover:opacity-100" />
          {/* Content */}
          <div className="relative z-10 font-syne text-[clamp(80px,10vw,120px)] leading-none text-tag-orange">
            {program.number}
          </div>
          <div className="relative z-10 mt-auto font-mono text-[13px] uppercase tracking-[0.08em] text-tag-muted">
            {program.label}
          </div>
        </div>
      ))}
      <div
        className="reveal-scale flex min-h-[50vh] cursor-pointer flex-col justify-between border-2 border-tag-border bg-tag-bg p-10 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(255,95,31,0.1)_inset] max-md:min-h-[40vh]"
        style={{ transitionDelay: '300ms' }}
      >
        <div className="font-syne text-[clamp(48px,8vw,80px)] leading-none text-tag-text">
          JOIN &rarr;
        </div>
        <div className="mt-2 font-mono text-[13px] text-tag-orange">tag in</div>
      </div>
    </section>
  )
}
