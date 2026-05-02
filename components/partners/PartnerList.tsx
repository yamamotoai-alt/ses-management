'use client'

import { PartnerCompany } from '@/types'
import Link from 'next/link'
import { Building2, Mail, Phone, MessageSquare } from 'lucide-react'

export default function PartnerList({ partners }: { partners: PartnerCompany[] }) {
  if (partners.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">協業企業が登録されていません</p>
        <Link href="/partners/new" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          新規登録する →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {partners.map(p => (
        <Link
          key={p.id}
          href={`/partners/${p.id}`}
          className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {p.company_name}
                </h3>
                {p.partner_type && (
                  <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                    p.partner_type === '人員出し' ? 'bg-purple-100 text-purple-700' :
                    p.partner_type === '案件出し' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {p.partner_type}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {p.contact_person && (
                  <span>{p.contact_person}</span>
                )}
                {p.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />{p.email}
                  </span>
                )}
                {p.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />{p.phone}
                  </span>
                )}
                {p.contact_method && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />{p.contact_method}
                  </span>
                )}
              </div>
              {p.notes && (
                <p className="mt-2 text-xs text-slate-400 truncate">{p.notes}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
