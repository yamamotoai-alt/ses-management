export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { ChevronLeft, Calendar, MapPin, User, Globe, Send } from 'lucide-react'
import { Engineer } from '@/types'
import { formatRate } from '@/lib/format'

export default async function PartnerEngineerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('engineers')
    .select('id, initials, title, age, nearest_station, monthly_rate, client_rate, work_style, available_from, languages, frameworks, cloud_environments, db_skills, os_environments, tools, other_skills, skill_summary, working_hours, nationality, desired_project, notes, status')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const engineer = data as Engineer
  const displayName = engineer.initials || '—'
  const rate = engineer.client_rate ?? engineer.monthly_rate

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/partner/engineers" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> エンジニア一覧に戻る
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{displayName}</h2>
          <Badge variant="orange">待機中</Badge>
          {engineer.work_style && <Badge variant="blue">{engineer.work_style}</Badge>}
        </div>
        {engineer.title && (
          <p className="text-base text-slate-600 font-medium mb-1">{engineer.title}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
          {rate && (
            <span>{formatRate(rate)}</span>
          )}
          {engineer.available_from && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{engineer.available_from}〜稼働可能</span>
          )}
          {engineer.age && (
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{engineer.age}歳</span>
          )}
          {engineer.nearest_station && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{engineer.nearest_station}</span>
          )}
          {engineer.nationality && (
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{engineer.nationality}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* スキル情報 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">スキル情報</h3>
          {engineer.languages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">言語</p>
              <div className="flex flex-wrap gap-2">
                {engineer.languages.map(l => (
                  <span key={l.name} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                    {l.name}                  </span>
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
                    {f.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.cloud_environments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">クラウド環境</p>
              <div className="flex flex-wrap gap-2">
                {engineer.cloud_environments.map(c => (
                  <span key={c.name} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-lg">
                    {c.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.db_skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">DB</p>
              <div className="flex flex-wrap gap-2">
                {engineer.db_skills.map(d => (
                  <span key={d.name} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg">
                    {d.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.os_environments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">OS</p>
              <div className="flex flex-wrap gap-2">
                {engineer.os_environments.map(o => (
                  <span key={o.name} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg">
                    {o.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.tools.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">ツール環境</p>
              <div className="flex flex-wrap gap-2">
                {engineer.tools.map(t => (
                  <span key={t.name} className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-lg">
                    {t.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.other_skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">その他</p>
              <div className="flex flex-wrap gap-2">
                {engineer.other_skills.map(s => (
                  <span key={s.name} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg">
                    {s.name}                  </span>
                ))}
              </div>
            </div>
          )}
          {engineer.skill_summary && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">エンジニア概要</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{engineer.skill_summary}</p>
            </div>
          )}
        </div>

        {/* 稼働条件・その他 */}
        {(engineer.working_hours || engineer.desired_project || engineer.notes) && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">稼働条件・その他</h3>
            <dl className="space-y-3 text-sm">
              {engineer.working_hours && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-0.5">稼働時間</dt>
                  <dd className="text-slate-800">{engineer.working_hours}</dd>
                </div>
              )}
              {engineer.desired_project && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-0.5">希望案件</dt>
                  <dd className="text-slate-800">{engineer.desired_project}</dd>
                </div>
              )}
              {engineer.notes && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-0.5">備考</dt>
                  <dd className="text-slate-700 whitespace-pre-wrap">{engineer.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <p className="text-sm text-blue-800 mb-4">
            このエンジニアへのご紹介案件がございましたら、下記フォームよりご提案ください。
          </p>
          <Link
            href={`/partner/propose?for=${engineer.id}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            このエンジニアに案件を提案する
          </Link>
        </div>
      </div>
    </div>
  )
}
