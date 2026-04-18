import { redirect } from 'next/navigation'

export default function TastePage() {
  redirect('/portal/profile?tab=identity')
}
