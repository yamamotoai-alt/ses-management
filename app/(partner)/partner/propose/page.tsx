export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PartnerProjectProposalForm from '@/components/partner/PartnerProjectProposalForm'
import { Engineer } from '@/types'
import Badge from '@/components/ui/Badge'
import { Calendar, MapPin } from 'lucide-react'
import { formatRate } from '@/lib/format'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  searchParams: Promise<{ for?: string }>
}

export default async function PartnerProposePage({ searchParams }: Props) {
  const sp = await searchParams
  const engineerId = sp.for

  if (!engineerId) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('engineers')
    .select('id, initials, title, age, nearest_station, client_rate, monthly_rate, work_style, available_from, languages, frameworks, working_hours')
    .eq('id', engineerId)
    .single()

  if (!data) notFound()
  const engineer = data as Engineer
  const rate = engineer.client_rate ?? engineer.monthly_rate

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/partner/engineers/${engineer.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> エンジニア詳細に戻る
      </Link>

      {/* 対象エンジニア */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-8 text-white">
        <p className="text-xs text-slate-400 mb-2">提案先エンジニア</p>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span className="text-lg font-bold">{engineer.initials || '—'}</span>
          {engineer.work_style && <Badge variant="blue">{engineer.work_style}</Badge>}
        </div>
        {engineer.title && <p className="text-sm text-slate-300 mb-2">{engineer.title}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          {rate && <span>{formatRate(rate)}</span>}
          {engineer.available_from && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{engineer.available_from}〜</span>
          )}
          {engineer.nearest_station && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{engineer.nearest_station}</span>
          )}
        </div>
        {engineer.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {engineer.languages.slice(0, 6).map(l => (
              <span key={l.name} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                {l.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">案件提案フォーム</h2>
        <p className="text-slate-500 text-sm">
          このエンジニアに合った案件情報をご入力ください。<br />
          確認の上、担当者よりご連絡いたします。
        </p>
      </div>
      <PartnerProjectProposalForm engineerId={engineerId} />
    </div>
  )
}
