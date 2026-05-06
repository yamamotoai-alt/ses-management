export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, DollarSign, Clock, CalendarPlus, Building2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Project } from '@/types'
import ProjectListHeader from '@/components/projects/ProjectListHeader'
import { formatRateRange } from '@/lib/format'

interface Props {
  searchParams: Promise<{ q?: string; status?: string; work_style?: string; sort?: string }>
}

const PROJECT_SORT_OPTIONS = [
  { value: 'created_desc', label: '追加順（新しい順）' },
  { value: 'created_asc',  label: '追加順（古い順）' },
  { value: 'updated_desc', label: '更新順（新しい順）' },
  { value: 'updated_asc',  label: '更新順（古い順）' },
  { value: 'budget_desc',  label: '予算順（高い順）' },
  { value: 'budget_asc',   label: '予算順（低い順）' },
  { value: 'name_asc',     label: '案件名順（昇順）' },
]

export default async function ProjectsPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  const sort = sp.sort ?? 'created_desc'
  const sortMap: Record<string, { col: string; asc: boolean; nullsFirst?: boolean }> = {
    created_desc: { col: 'created_at', asc: false },
    created_asc:  { col: 'created_at', asc: true },
    updated_desc: { col: 'updated_at', asc: false },
    updated_asc:  { col: 'updated_at', asc: true },
    budget_desc:  { col: 'budget_max', asc: false, nullsFirst: false },
    budget_asc:   { col: 'budget_min', asc: true, nullsFirst: false },
    name_asc:     { col: 'name', asc: true },
  }
  const { col, asc, nullsFirst } = sortMap[sort] ?? sortMap.created_desc

  let query = supabase.from('projects').select('*').order(col, { ascending: asc, nullsFirst: nullsFirst ?? true })

  if (sp.status) query = query.eq('status', sp.status)
  if (sp.work_style) query = query.eq('work_style', sp.work_style)
  if (sp.q) query = query.ilike('name', `%${sp.q}%`)

  const { data: projects } = await query

  return (
    <div className="p-4 md:p-8">
      <ProjectListHeader projects={(projects ?? []) as Project[]} count={projects?.length ?? 0} />

      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="案件名で検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select name="status" defaultValue={sp.status} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">ステータス: 全て</option>
          <option value="募集中">募集中</option>
          <option value="draft">ドラフト</option>
          <option value="終了">終了</option>
        </select>
        <select name="work_style" defaultValue={sp.work_style} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">稼働形態: 全て</option>
          <option value="フルリモート">フルリモート</option>
          <option value="ハイブリッド">ハイブリッド</option>
          <option value="常駐">常駐</option>
        </select>
        <select name="sort" defaultValue={sp.sort} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {PROJECT_SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">検索</button>
        <Link href="/projects" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 flex items-center">クリア</Link>
      </form>

      {(projects?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">案件が登録されていません</p>
          <Link href="/projects/new" className="mt-4 inline-block text-sm text-blue-600 hover:underline">新規登録する →</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(projects as Project[]).map(proj => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{proj.name}</h3>
                    {proj.status === 'draft'
                      ? <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded font-medium">ドラフト</span>
                      : <Badge variant={proj.status === '募集中' ? 'green' : 'gray'}>{proj.status}</Badge>
                    }
                    {proj.work_style && <Badge variant="blue">{proj.work_style}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {(proj.budget_skill_based || proj.budget_min || proj.budget_max) && (
                      <span className="flex items-center gap-1">
                        {proj.budget_skill_based ? 'スキル見合い' : formatRateRange(proj.budget_min, proj.budget_max)}
                      </span>
                    )}
                    {proj.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{proj.duration}
                      </span>
                    )}
                    {proj.required_experience_years && (
                      <span>{proj.required_experience_years}年以上の経験</span>
                    )}
                    {proj.introducer && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />{proj.introducer}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarPlus className="w-3.5 h-3.5" />
                      {new Date(proj.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {(proj.required_languages ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proj.required_languages.slice(0, 5).map(l => (
                        <span key={l.name} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {l.name}({l.years}年+)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
