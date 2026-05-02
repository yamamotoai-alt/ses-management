export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Engineer } from '@/types'
import { formatRate } from '@/lib/format'
import { Calendar, Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string; work_style?: string; sort?: string }>
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: '追加順（新しい順）' },
  { value: 'created_asc',  label: '追加順（古い順）' },
  { value: 'rate_desc',    label: '単価順（高い順）' },
  { value: 'rate_asc',     label: '単価順（低い順）' },
  { value: 'age_asc',      label: '年齢順（若い順）' },
  { value: 'age_desc',     label: '年齢順（高い順）' },
]

export default async function PartnerEngineersPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  const sort = sp.sort ?? 'created_desc'
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    created_desc: { col: 'created_at',   asc: false },
    created_asc:  { col: 'created_at',   asc: true },
    rate_desc:    { col: 'client_rate',  asc: false },
    rate_asc:     { col: 'client_rate',  asc: true },
    age_asc:      { col: 'age',          asc: true },
    age_desc:     { col: 'age',          asc: false },
  }
  const { col, asc } = sortMap[sort] ?? sortMap.created_desc

  let query = supabase
    .from('engineers')
    .select('id, initials, title, age, nearest_station, monthly_rate, client_rate, work_style, available_from, languages, frameworks, cloud_environments, db_skills, os_environments, tools, other_skills, skill_summary, working_hours, nationality, desired_project, notes, status')
    .eq('status', '待機中')
    .order(col, { ascending: asc, nullsFirst: false })

  if (sp.work_style) query = query.eq('work_style', sp.work_style)
  if (sp.q) query = query.ilike('initials', `%${sp.q}%`)

  const { data } = await query
  const engineers = (data ?? []) as Engineer[]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">稼働可能エンジニア一覧</h2>
        <p className="text-slate-500 text-sm mt-1">待機中 {engineers.length}名</p>
      </div>

      {/* 検索・フィルター */}
      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[160px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="イニシャルで検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          検索
        </button>
        <Link href="/partner/engineers" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 flex items-center">
          クリア
        </Link>
      </form>

      {engineers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">条件に一致するエンジニアはいません</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {engineers.map(eng => {
            const rate = eng.client_rate ?? eng.monthly_rate
            return (
              <Link
                key={eng.id}
                href={`/partner/engineers/${eng.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {eng.initials || '—'}
                      </h3>
                      {eng.work_style && <Badge variant="blue">{eng.work_style}</Badge>}
                    </div>
                    {eng.title && <p className="text-sm text-slate-600 mb-2">{eng.title}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      {rate && (
                        <span>{formatRate(rate)}</span>
                      )}
                      {eng.age && <span>{eng.age}歳</span>}
                      {eng.available_from && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />{eng.available_from}〜
                        </span>
                      )}
                      {eng.working_hours && <span>{eng.working_hours}</span>}
                    </div>
                    {eng.languages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {eng.languages.slice(0, 5).map(l => (
                          <span key={l.name} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                            {l.name}
                          </span>
                        ))}
                        {eng.languages.length > 5 && (
                          <span className="px-2 py-0.5 text-xs text-slate-400">+{eng.languages.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
