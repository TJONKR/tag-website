import { cn } from '@lib/utils'

interface LogoProps {
  className?: string
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <svg
      viewBox="0 0 43 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M24.8594 13.3896L34.3271 3.92188L39.0781 8.67285L29.6104 18.1406H43V24.8594H29.6104L39.0781 34.3271L34.3271 39.0781L24.8594 29.6104V43H18.1406V29.6104L8.67285 39.0781L3.92188 34.3271L13.3896 24.8594H0V18.1406H13.3896L3.92188 8.67285L8.67285 3.92188L18.1406 13.3896V0H24.8594V13.3896ZM18.1406 18.1406V24.8594H24.8594V18.1406H18.1406Z"
        fill="#FF3D44"
      />
    </svg>
  )
}
