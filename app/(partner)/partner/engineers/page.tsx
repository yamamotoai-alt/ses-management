export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Engineer } from '@/types'
import { formatRate } from '@/lib/format'
import { Calendar, MapPin, Search, Send, Zap } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string; skill?: string; work_style?: string; available_from?: string; sort?: string }>
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: '追加順（新しい順）' },
  { value: 'rate_desc',    label: '単価順（高い順）' },
  { value: 'rate_asc',     label: '単価順（低い順）' },
  { value: 'age_asc',      label: '年齢順（若い順）' },
]

const AVAILABLE_OPTIONS = [
  '即日', '今月', '翌月',
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

function hasSkill(eng: Engineer, keyword: string): boolean {
  const kw = keyword.toLowerCase()
  const allSkills = [
    ...eng.languages,
    ...eng.frameworks,
    ...eng.cloud_environments,
    ...eng.db_skills,
    ...eng.os_environments,
    ...eng.tools,
    ...eng.other_skills,
  ]
  return allSkills.some(s => s.name.toLowerCase().includes(kw))
}

function SkillBadges({ engineer, keyword }: { engineer: Engineer; keyword?: string }) {
  const groups = [
    { items: engineer.languages,         color: 'bg-blue-50 text-blue-700' },
    { items: engineer.frameworks,        color: 'bg-purple-50 text-purple-700' },
    { items: engineer.cloud_environments,color: 'bg-orange-50 text-orange-700' },
    { items: engineer.db_skills,         color: 'bg-green-50 text-green-700' },
    { items: engineer.tools,             color: 'bg-teal-50 text-teal-700' },
  ]
  const kw = keyword?.toLowerCase()
  const all = groups.flatMap(g => g.items.map(item => ({
    name: item.name,
    color: g.color,
    matched: kw ? item.name.toLowerCase().includes(kw) : false,
  })))
  if (all.length === 0) return null
  const visible = all.slice(0, 8)
  const rest = all.length - visible.length
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {visible.map(s => (
        <span
          key={s.name}
          className={`px-2 py-0.5 text-xs rounded font-medium ${
            s.matched
              ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-400'
              : s.color
          }`}
        >
          {s.name}
        </span>
      ))}
      {rest > 0 && (
        <span className="px-2 py-0.5 text-xs text-slate-400">+{rest}</span>
      )}
    </div>
  )
}

export default async function PartnerEngineersPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  const sort = sp.sort ?? 'created_desc'
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    created_desc: { col: 'created_at',  asc: false },
    rate_desc:    { col: 'client_rate', asc: false },
    rate_asc:     { col: 'client_rate', asc: true },
    age_asc:      { col: 'age',         asc: true },
  }
  const { col, asc } = sortMap[sort] ?? sortMap.created_desc

  let query = supabase
    .from('engineers')
    .select('id, initials, title, age, nearest_station, monthly_rate, client_rate, work_style, available_from, languages, frameworks, cloud_environments, db_skills, os_environments, tools, other_skills, skill_summary, working_hours, desired_project, status')
    .eq('status', '待機中')
    .order(col, { ascending: asc, nullsFirst: false })

  if (sp.work_style) query = query.eq('work_style', sp.work_style)
  if (sp.available_from) query = query.eq('available_from', sp.available_from)

  const { data } = await query
  let engineers = (data ?? []) as Engineer[]

  // スキル検索はJS側でフィルタリング（JSONB配列のため）
  if (sp.skill?.trim()) {
    engineers = engineers.filter(e => hasSkill(e, sp.skill!.trim()))
  }

  const isFiltered = !!(sp.q || sp.skill || sp.work_style || sp.available_from)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">稼働可能エンジニア一覧</h2>
        <p className="text-slate-500 text-sm mt-1">
          待機中 {engineers.length}名
          {isFiltered && <span className="ml-2 text-blue-600 font-medium">（絞り込み中）</span>}
        </p>
      </div>

      {/* 検索・フィルター */}
      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* スキル検索 */}
          <div className="flex-1 min-w-[180px] relative">
            <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="skill"
              defaultValue={sp.skill}
              placeholder="スキルで検索（Java, AWS, React...）"
              className="w-full border border-blue-200 bg-blue-50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-blue-300"
            />
          </div>
          {/* 稼働形態 */}
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
          {/* 参画時期 */}
          <select
            name="available_from"
            defaultValue={sp.available_from}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">参画時期: 全て</option>
            {AVAILABLE_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {/* ソート */}
          <select
            name="sort"
            defaultValue={sp.sort}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />検索
          </button>
          {isFiltered && (
            <Link href="/partner/engineers" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2">
              クリア
            </Link>
          )}
          {sp.skill && (
            <p className="text-xs text-blue-600">
              「<strong>{sp.skill}</strong>」のスキルを持つエンジニア: {engineers.length}名
            </p>
          )}
        </div>
      </form>

      {engineers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">条件に一致するエンジニアはいません</p>
          <Link href="/partner/engineers" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            検索条件をクリア
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {engineers.map(eng => {
            const rate = eng.client_rate ?? eng.monthly_rate
            return (
              <div
                key={eng.id}
                className="bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <Link href={`/partner/engineers/${eng.id}`} className="block p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 名前・バッジ */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                          {eng.initials || '—'}
                        </h3>
                        {eng.work_style && <Badge variant="blue">{eng.work_style}</Badge>}
                        {eng.available_from && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3" />{eng.available_from}〜参画可
                          </span>
                        )}
                      </div>
                      {/* タイトル */}
                      {eng.title && (
                        <p className="text-sm text-slate-600 font-medium mb-2">{eng.title}</p>
                      )}
                      {/* メタ情報 */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        {rate && <span className="font-semibold text-slate-700">{formatRate(rate)}</span>}
                        {eng.age && <span>{eng.age}歳</span>}
                        {eng.nearest_station && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{eng.nearest_station}</span>
                        )}
                        {eng.working_hours && <span>{eng.working_hours}</span>}
                      </div>
                      {/* スキルバッジ */}
                      <SkillBadges engineer={eng} keyword={sp.skill} />
                      {/* 希望案件 */}
                      {eng.desired_project && (
                        <p className="mt-2 text-xs text-slate-400 truncate">希望: {eng.desired_project}</p>
                      )}
                    </div>
                  </div>
                </Link>
                {/* 提案ボタン */}
                <div className="px-5 pb-4">
                  <Link
                    href={`/partner/propose?for=${eng.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <Send className="w-3 h-3" />案件を提案する
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
