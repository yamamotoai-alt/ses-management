export const runtime = 'edge'

import { redirect } from 'next/navigation'

export default function PartnerProjectsPage() {
  redirect('/partner/engineers')
}
