export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EngineerList from '@/components/engineers/EngineerList'
import { ExportEngineersButton } from '@/components/ui/ExportCsvButton'
import { Plus, Search } from 'lucide-react'
import { Engineer } from '@/types'
import { getRole } from '@/lib/role'

interface Props {
  searchParams: Promise<{ q?: string; status?: string; work_style?: string; sort?: string; tab?: string }>
}

const ENGINEER_SORT_OPTIONS = [
  { value: 'created_desc', label: '追加順（新しい順）' },
  { value: 'created_asc',  label: '追加順（古い順）' },
  { value: 'updated_desc', label: '更新順（新しい順）' },
  { value: 'updated_asc',  label: '更新順（古い順）' },
  { value: 'age_asc',      label: '年齢順（若い順）' },
  { value: 'age_desc',     label: '年齢順（高い順）' },
  { value: 'rate_desc',    label: '単価順（高い順）' },
  { value: 'rate_asc',     label: '単価順（低い順）' },
  { value: 'name_asc',     label: '氏名順（昇順）' },
]

export default async function EngineersPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()
  const role = await getRole()

  const tab = sp.tab === 'interviewed' ? 'interviewed' : 'pre'

  const sort = sp.sort ?? 'created_desc'
  const sortMap: Record<string, { col: string; asc: boolean; nullsFirst?: boolean }> = {
    created_desc: { col: 'created_at', asc: false },
    created_asc:  { col: 'created_at', asc: true },
    updated_desc: { col: 'updated_at', asc: false },
    updated_asc:  { col: 'updated_at', asc: true },
    age_asc:      { col: 'age', asc: true, nullsFirst: false },
    age_desc:     { col: 'age', asc: false, nullsFirst: false },
    rate_desc:    { col: 'monthly_rate', asc: false, nullsFirst: false },
    rate_asc:     { col: 'monthly_rate', asc: true, nullsFirst: false },
    name_asc:     { col: 'name', asc: true },
  }
  const { col, asc, nullsFirst } = sortMap[sort] ?? sortMap.created_desc

  let query = supabase.from('engineers').select('*')
    .eq('interviewed', tab === 'interviewed')
    .order(col, { ascending: asc, nullsFirst: nullsFirst ?? true })

  if (sp.status) query = query.eq('status', sp.status)
  if (sp.work_style) query = query.eq('work_style', sp.work_style)
  if (sp.q) query = query.or(`name.ilike.%${sp.q}%,username.ilike.%${sp.q}%`)

  const { data: engineers } = await query

  // タブカウント用
  const { count: preCount } = await supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('interviewed', false)
  const { count: interviewedCount } = await supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('interviewed', true)

  const tabBase = (t: string) => {
    const params = new URLSearchParams({ tab: t })
    if (sp.q) params.set('q', sp.q)
    if (sp.status) params.set('status', sp.status)
    if (sp.work_style) params.set('work_style', sp.work_style)
    if (sp.sort) params.set('sort', sp.sort)
    return `/engineers?${params.toString()}`
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">エンジニア管理</h2>
          <p className="text-slate-500 text-sm mt-1">{engineers?.length ?? 0}名</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportEngineersButton engineers={(engineers ?? []) as Engineer[]} />
          <Link
            href="/engineers/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">新規登録</span>
          </Link>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        <Link
          href={tabBase('pre')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${tab === 'pre' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          事前面談前
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === 'pre' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>{preCount ?? 0}</span>
        </Link>
        <Link
          href={tabBase('interviewed')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${tab === 'interviewed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          事前面談後
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === 'interviewed' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{interviewedCount ?? 0}</span>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <input type="hidden" name="tab" value={tab} />
        <div className="flex-1 min-w-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="氏名・ユーザーネームで検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ステータス: 全て</option>
          <option value="稼働中">稼働中</option>
          <option value="待機中">待機中</option>
          <option value="別企業で稼働">別企業で稼働</option>
        </select>
        <select
          name="work_style"
          defaultValue={sp.work_style}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">稼働形態: 全て</option>
          <option value="フルリモート">フルリモート</option>
          <option value="ハイブリッド">ハイブリッド</option>
          <option value="常駐">常駐</option>
        </select>
        <select
          name="sort"
          defaultValue={sp.sort}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ENGINEER_SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          検索
        </button>
        <Link href={`/engineers?tab=${tab}`} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 flex items-center">
          クリア
        </Link>
      </form>

      <EngineerList engineers={(engineers ?? []) as Engineer[]} role={role} />
    </div>
  )
}
