import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, DollarSign, Clock } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { ExportProjectsButton } from '@/components/ui/ExportCsvButton'
import { Project } from '@/types'

interface Props {
  searchParams: { q?: string; status?: string; work_style?: string }
}

export default async function ProjectsPage({ searchParams }: Props) {
  const supabase = createClient()

  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.work_style) query = query.eq('work_style', searchParams.work_style)
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const { data: projects } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">案件管理</h2>
          <p className="text-slate-500 text-sm mt-1">{projects?.length ?? 0}件の案件</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportProjectsButton projects={(projects ?? []) as Project[]} />
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> 新規登録
          </Link>
        </div>
      </div>

      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="案件名で検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select name="status" defaultValue={searchParams.status} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">ステータス: 全て</option>
          <option value="募集中">募集中</option>
          <option value="終了">終了</option>
        </select>
        <select name="work_style" defaultValue={searchParams.work_style} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">稼働形態: 全て</option>
          <option value="フルリモート">フルリモート</option>
          <option value="ハイブリッド">ハイブリッド</option>
          <option value="常駐">常駐</option>
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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{proj.name}</h3>
                    <Badge variant={proj.status === '募集中' ? 'green' : 'gray'}>{proj.status}</Badge>
                    {proj.work_style && <Badge variant="blue">{proj.work_style}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {(proj.budget_min || proj.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {proj.budget_min?.toLocaleString() ?? '?'}〜{proj.budget_max?.toLocaleString() ?? '?'}円/月
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
                  </div>
                  {proj.required_languages.length > 0 && (
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
