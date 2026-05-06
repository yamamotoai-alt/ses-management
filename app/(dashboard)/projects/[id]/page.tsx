export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import MatchingSection from '@/components/matching/MatchingSection'
import ProjectDetailActions from '@/components/projects/ProjectDetailActions'
import { ChevronLeft, Clock, Users, MapPin, Timer, MessageSquare, GitBranch } from 'lucide-react'
import { Project } from '@/types'
import { getRole } from '@/lib/role'
import { formatRateRange } from '@/lib/format'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const role = await getRole()
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
              <span>
                予算 {project.budget_skill_based ? 'スキル見合い' : (project.budget_min || project.budget_max) ? formatRateRange(project.budget_min, project.budget_max) : '未設定'}
              </span>
              {(project.engineer_price_min || project.engineer_price_max) && (
                <span>提示 {formatRateRange(project.engineer_price_min, project.engineer_price_max)}</span>
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
          {role !== 'partner' && <ProjectDetailActions project={project} role={role} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 案件詳細 */}
          {(project.required_requirements || project.preferred_requirements || project.description || project.project_content || project.project_notes) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-700">案件詳細</h3>
              {project.required_requirements && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">必須要件</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.required_requirements}</p>
                </div>
              )}
              {project.preferred_requirements && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">歓迎要件</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.preferred_requirements}</p>
                </div>
              )}
              {project.description && (
                <div className="pt-3 border-t border-slate-100">
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
                { label: '紹介者名', value: project.introducer, internal: true },
                { label: '商流', value: project.commercial_flow, internal: true },
                { label: '面談回数', value: project.interview_count, internal: false },
                { label: '勤務場所', value: project.work_location, internal: false },
                { label: '勤務時間', value: project.work_hours, internal: false },
                {
                  label: 'エンジニア提示金額',
                  internal: true,
                  value: (project.engineer_price_min || project.engineer_price_max)
                    ? formatRateRange(project.engineer_price_min, project.engineer_price_max)
                    : null,
                },
              ]
                .filter(item => role !== 'partner' || !item.internal)
                .map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-slate-500 text-xs font-medium mb-0.5">{label}</dt>
                    <dd className="text-slate-800 font-medium">{value || '—'}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* 編集・削除（admin・salesのみ） */}
        </div>

        <div className="lg:col-span-1">
          {role !== 'partner' && <MatchingSection type="project" id={project.id} />}
        </div>
      </div>
    </div>
  )
}
