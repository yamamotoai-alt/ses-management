import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import MatchingSection from '@/components/matching/MatchingSection'
import { ChevronLeft, Edit, DollarSign, Clock, Users } from 'lucide-react'
import { Project } from '@/types'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('projects').select('*').eq('id', params.id).single()
  if (!data) notFound()
  const project = data as Project

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 案件一覧に戻る
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
              <Badge variant={project.status === '募集中' ? 'green' : 'gray'}>{project.status}</Badge>
              {project.work_style && <Badge variant="blue">{project.work_style}</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
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
            </div>
          </div>
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" /> 編集
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
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
            {project.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">案件概要</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">その他情報</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500 text-xs font-medium mb-0.5">紹介者名</dt>
                <dd className="text-slate-800 font-medium">{project.introducer || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="col-span-1">
          <MatchingSection type="project" id={project.id} />
        </div>
      </div>
    </div>
  )
}
