export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PartnerList from '@/components/partners/PartnerList'
import { Plus, Search } from 'lucide-react'
import { PartnerCompany } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; partner_type?: string }>
}

export default async function PartnersPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase.from('partner_companies').select('*').order('created_at', { ascending: false })
  if (sp.q) query = query.ilike('company_name', `%${sp.q}%`)
  if (sp.partner_type) query = query.eq('partner_type', sp.partner_type)

  const { data: partners } = await query

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">協業企業管理</h2>
          <p className="text-slate-500 text-sm mt-1">{partners?.length ?? 0}社</p>
        </div>
        <Link
          href="/partners/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">新規登録</span>
        </Link>
      </div>

      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="企業名で検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          name="partner_type"
          defaultValue={sp.partner_type}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">取引区分: 全て</option>
          <option value="人員出し">人員出し</option>
          <option value="案件出し">案件出し</option>
          <option value="両方">両方</option>
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          検索
        </button>
        <Link href="/partners" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 flex items-center">
          クリア
        </Link>
      </form>

      <PartnerList partners={(partners ?? []) as PartnerCompany[]} />
    </div>
  )
}
