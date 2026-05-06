export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PartnerForm from '@/components/partners/PartnerForm'
import { ChevronLeft } from 'lucide-react'
import { PartnerCompany } from '@/types'

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('partner_companies').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href={`/partners/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 詳細に戻る
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">協業企業 編集</h2>
      </div>
      <PartnerForm partner={data as PartnerCompany} />
    </div>
  )
}
