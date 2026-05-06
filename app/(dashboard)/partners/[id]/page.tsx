export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Edit, Building2, Mail, Phone, MessageSquare, User, FileText, Tag } from 'lucide-react'
import { PartnerCompany } from '@/types'
import PartnerDeleteButton from '@/components/partners/PartnerDeleteButton'

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('partner_companies').select('*').eq('id', id).single()
  if (!data) notFound()
  const partner = data as PartnerCompany

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/partners" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 協業企業一覧に戻る
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Building2 className="w-6 h-6 text-slate-400 flex-shrink-0" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">{partner.company_name}</h2>
            {partner.partner_type && (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                partner.partner_type === '人員出し' ? 'bg-purple-100 text-purple-700' :
                partner.partner_type === '案件出し' ? 'bg-emerald-100 text-emerald-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {partner.partner_type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/partners/${partner.id}/edit`}
              className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" /> 編集
            </Link>
            <PartnerDeleteButton id={partner.id} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">企業情報</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="flex items-start gap-3">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-0.5">取引区分</dt>
              <dd className="text-slate-800 font-medium">{partner.partner_type || '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-0.5">担当者名</dt>
              <dd className="text-slate-800 font-medium">{partner.contact_person || '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-0.5">連絡手段</dt>
              <dd className="text-slate-800 font-medium">{partner.contact_method || '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-0.5">メールアドレス</dt>
              <dd className="text-slate-800 font-medium">
                {partner.email
                  ? <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">{partner.email}</a>
                  : '—'}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-0.5">電話番号</dt>
              <dd className="text-slate-800 font-medium">
                {partner.phone
                  ? <a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">{partner.phone}</a>
                  : '—'}
              </dd>
            </div>
          </div>
          {partner.notes && (
            <div className="sm:col-span-2 flex items-start gap-3">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-0.5">備考</dt>
                <dd className="text-slate-700 whitespace-pre-wrap">{partner.notes}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
