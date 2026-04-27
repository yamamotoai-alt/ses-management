export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import MatchingSection from '@/components/matching/MatchingSection'
import EngineerDetailActions from '@/components/engineers/EngineerDetailActions'
import { ChevronLeft, MapPin, DollarSign, Calendar, User } from 'lucide-react'
import { Engineer, Proposal } from '@/types'

export default async function EngineerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('engineers').select('*').eq('id', id).single()
  if (!data) notFound()
  const engineer = data as Engineer

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, projects(id, name)')
    .eq('engineer_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const activeProposal = (proposals as Proposal[] | null)?.find(p =>
    ['稼働開始', '受注', '結果待ち', '面談済', '面談調整中', '提案中'].includes(p.status)
  )

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/engineers" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> エンジニア一覧に戻る
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">{engineer.name}</h2>
              <Badge variant={engineer.status === '稼働中' ? 'green' : 'orange'}>{engineer.status}</Badge>
              {engineer.work_style && <Badge variant="blue">{engineer.work_style}</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              {engineer.nearest_station && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{engineer.nearest_station}</span>
              )}
              {engineer.monthly_rate && (
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{engineer.monthly_rate.toLocaleString()}円/月</span>
              )}
              {engineer.available_from && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{engineer.available_from}〜稼働可能</span>
              )}
              {engineer.age && (
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{engineer.age}歳</span>
              )}
              {activeProposal?.projects && (
                <span className="flex items-center gap-1 text-blue-600">
                  現在: <Link href={`/projects/${activeProposal.project_id}`} className="hover:underline">{(activeProposal.projects as { id: string; name: string }).name}</Link>（{activeProposal.status}）
                </span>
              )}
            </div>
          </div>
          <EngineerDetailActions engineer={engineer} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* スキル */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">スキル情報</h3>
            {engineer.languages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">言語</p>
                <div className="flex flex-wrap gap-2">
                  {engineer.languages.map(l => (
                    <span key={l.name} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                      {l.name} <span className="text-blue-400">{l.years}年</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {engineer.frameworks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">フレームワーク</p>
                <div className="flex flex-wrap gap-2">
                  {engineer.frameworks.map(f => (
                    <span key={f.name} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg">
                      {f.name} <span className="text-purple-400">{f.years}年</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {engineer.cloud_environments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">クラウド環境</p>
                <div className="flex flex-wrap gap-2">
                  {engineer.cloud_environments.map(c => (
                    <span key={c.name} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-lg">
                      {c.name} <span className="text-orange-400">{c.years}年</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {engineer.skill_summary && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">スキル概要</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{engineer.skill_summary}</p>
              </div>
            )}
          </div>

          {/* 営業情報 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">営業情報</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: '上位営業先', value: engineer.top_sales_target },
                { label: '面接担当者', value: engineer.interview_person },
                { label: '営業担当者', value: engineer.sales_person },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-slate-500 text-xs font-medium mb-0.5">{label}</dt>
                  <dd className="text-slate-800 font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 提案履歴 */}
          {proposals && proposals.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">提案履歴</h3>
              <div className="space-y-2">
                {(proposals as (Proposal & { projects: { id: string; name: string } | null })[]).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <Link href={`/projects/${p.project_id}`} className="text-slate-700 hover:text-blue-600">
                      {p.projects?.name ?? '—'}
                    </Link>
                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                      p.status === '稼働開始' ? 'bg-green-100 text-green-700' :
                      p.status === '受注' ? 'bg-blue-100 text-blue-700' :
                      p.status === '結果待ち' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === '終了' ? 'bg-slate-100 text-slate-500' :
                      'bg-slate-100 text-slate-600'
                    }`}>{p.status}</span>
                  </div>
                ))}
              </div>
              <Link href="/pipeline" className="mt-3 block text-xs text-blue-600 hover:underline">
                パイプライン全体を見る →
              </Link>
            </div>
          )}
        </div>

        {/* AIマッチング */}
        <div className="lg:col-span-1">
          <MatchingSection type="engineer" id={engineer.id} />
        </div>
      </div>
    </div>
  )
}
