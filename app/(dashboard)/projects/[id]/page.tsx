export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import MatchingSection from '@/components/matching/MatchingSection'
import { ChevronLeft, Edit, DollarSign, Clock, Users, MapPin, Timer, MessageSquare, GitBranch } from 'lucide-react'
import { Project } from '@/types'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!data) notFound()
  const project = data as Project

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 案件一覧に戻る
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">{project.name}</h2>
              <Badge variant={project.status === '募集中' ? 'green' : 'gray'}>{project.status}</Badge>
              {project.work_style && <Badge variant="blue">{project.work_style}</Badge>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-2">
              {(project.budget_min || project.budget_max) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {project.budget_min?.toLocaleString() ?? '?'}〜{project.budget_max?.toLocaleString() ?? '?'}円/月
                </span>
              )}
              {project.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{project.duration}</span>}
              {project.required_experience_years && (
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.required_experience_years}年以上</span>
              )}
              {project.work_location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.work_location}</span>
              )}
              {project.work_hours && (
                <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{project.work_hours}</span>
              )}
              {project.interview_count && (
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />面談{project.interview_count}</span>
              )}
              {project.commercial_flow && (
                <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" />{project.commercial_flow}</span>
              )}
            </div>
          </div>
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Edit className="w-4 h-4" /> 編集
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 必須スキル */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">必須スキル</h3>
            {project.required_languages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">必須言語</p>
                <div className="flex flex-wrap gap-2">
                  {project.required_languages.map(l => (
                    <span key={l.name} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                      {l.name} <span className="text-blue-400">{l.years}年+</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.required_frameworks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">必須フレームワーク</p>
                <div className="flex flex-wrap gap-2">
                  {project.required_frameworks.map(f => (
                    <span key={f.name} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg">
                      {f.name} <span className="text-purple-400">{f.years}年+</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.required_cloud.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">クラウド環境</p>
                <div className="flex flex-wrap gap-2">
                  {project.required_cloud.map(c => (
                    <span key={c.name} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-lg">
                      {c.name} <span className="text-orange-400">{c.years}年+</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.required_languages.length === 0 && project.required_frameworks.length === 0 && project.required_cloud.length === 0 && (
              <p className="text-sm text-slate-400">必須スキルが設定されていません</p>
            )}
          </div>

          {/* 尚可スキル */}
          {((project.optional_languages?.length ?? 0) > 0 || (project.optional_frameworks?.length ?? 0) > 0 || (project.optional_cloud?.length ?? 0) > 0) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">尚可スキル</h3>
              {(project.optional_languages?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">尚可言語</p>
                  <div className="flex flex-wrap gap-2">
                    {project.optional_languages.map(l => (
                      <span key={l.name} className="px-3 py-1 bg-blue-50/60 text-blue-600 text-sm rounded-lg border border-blue-100">
                        {l.name} <span className="text-blue-400">{l.years}年+</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(project.optional_frameworks?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">尚可フレームワーク</p>
                  <div className="flex flex-wrap gap-2">
                    {project.optional_frameworks.map(f => (
                      <span key={f.name} className="px-3 py-1 bg-purple-50/60 text-purple-600 text-sm rounded-lg border border-purple-100">
                        {f.name} <span className="text-purple-400">{f.years}年+</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(project.optional_cloud?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">尚可クラウド</p>
                  <div className="flex flex-wrap gap-2">
                    {project.optional_cloud.map(c => (
                      <span key={c.name} className="px-3 py-1 bg-orange-50/60 text-orange-600 text-sm rounded-lg border border-orange-100">
                        {c.name} <span className="text-orange-400">{c.years}年+</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 案件詳細 */}
          {(project.description || project.project_content || project.project_notes) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-700">案件詳細</h3>
              {project.description && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">案件概要</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}
              {project.project_content && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">案件内容</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.project_content}</p>
                </div>
              )}
              {project.project_notes && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">備考</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.project_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* その他情報 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">その他情報</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: '紹介者名', value: project.introducer },
                { label: '商流', value: project.commercial_flow },
                { label: '面談回数', value: project.interview_count },
                { label: '勤務場所', value: project.work_location },
                { label: '勤務時間', value: project.work_hours },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-slate-500 text-xs font-medium mb-0.5">{label}</dt>
                  <dd className="text-slate-800 font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-1">
          <MatchingSection type="project" id={project.id} />
        </div>
      </div>
    </div>
  )
}
