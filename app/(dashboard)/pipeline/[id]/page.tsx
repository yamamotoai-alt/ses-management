export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { ChevronLeft, User, Briefcase, Building2, Mail, Phone, DollarSign, Clock, MapPin, Timer, MessageSquare, Users, Calendar } from 'lucide-react'
import { Proposal, Engineer, Project } from '@/types'
import { formatRate, formatRateRange } from '@/lib/format'
import ProposalStatusSelect from '@/components/pipeline/ProposalStatusSelect'

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('proposals')
    .select(`
      *,
      engineers(*),
      projects(*)
    `)
    .eq('id', id)
    .single()

  if (!data) notFound()
  const proposal = data as Proposal & { engineers: Engineer; projects: Project }
  const eng = proposal.engineers
  const proj = proposal.projects
  const isPartner = proposal.channel === 'パートナーからの提案'

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/pipeline" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 提案パイプラインに戻る
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isPartner ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  <Building2 className="w-3 h-3" />パートナーからの提案
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  社内提案
                </span>
              )}
              <Badge variant={
                proposal.status === '受注' || proposal.status === '稼働開始' ? 'green' :
                proposal.status === '終了' ? 'gray' : 'blue'
              }>{proposal.status}</Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              {eng?.name ?? '—'} × {proj?.name ?? '—'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              登録日: {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <ProposalStatusSelect proposalId={proposal.id} currentStatus={proposal.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* エンジニア情報 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />エンジニア
            </h3>
            <Link href={`/engineers/${proposal.engineer_id}`} className="text-xs text-blue-600 hover:underline">
              詳細を見る →
            </Link>
          </div>
          {eng ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">氏名</dt>
                <dd className="font-medium text-slate-800">{eng.name}</dd>
              </div>
              {eng.title && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">タイトル</dt>
                  <dd className="text-slate-700">{eng.title}</dd>
                </div>
              )}
              <div className="flex gap-6">
                {eng.age && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5">年齢</dt>
                    <dd className="font-medium text-slate-800">{eng.age}歳</dd>
                  </div>
                )}
                {eng.monthly_rate && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5">単価</dt>
                    <dd className="font-medium text-slate-800">{formatRate(eng.monthly_rate)}</dd>
                  </div>
                )}
                {eng.work_style && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5">稼働形態</dt>
                    <dd><Badge variant="blue">{eng.work_style}</Badge></dd>
                  </div>
                )}
              </div>
              {eng.available_from && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5">参画可能時期</dt>
                  <dd className="text-slate-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{eng.available_from}〜</dd>
                </div>
              )}
              {eng.languages?.length > 0 && (
                <div>
                  <dt className="text-xs text-slate-500 mb-1.5">主要スキル</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {[...eng.languages, ...eng.frameworks].slice(0, 8).map(s => (
                      <span key={s.name} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{s.name}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          ) : <p className="text-sm text-slate-400">エンジニア情報なし</p>}
        </div>

        {/* 案件情報 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />案件
            </h3>
            <Link href={`/projects/${proposal.project_id}`} className="text-xs text-blue-600 hover:underline">
              詳細を見る →
            </Link>
          </div>
          {proj ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">案件名</dt>
                <dd className="font-medium text-slate-800">{proj.name}</dd>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {(proj.budget_min || proj.budget_max) && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3" />予算</dt>
                    <dd className="font-medium text-slate-800">{formatRateRange(proj.budget_min, proj.budget_max)}</dd>
                  </div>
                )}
                {proj.work_style && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-0.5">稼働形態</dt>
                    <dd><Badge variant="blue">{proj.work_style}</Badge></dd>
                  </div>
                )}
              </div>
              {proj.duration && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />期間</dt>
                  <dd className="text-slate-700">{proj.duration}</dd>
                </div>
              )}
              {proj.work_location && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />勤務場所</dt>
                  <dd className="text-slate-700">{proj.work_location}</dd>
                </div>
              )}
              {proj.work_hours && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Timer className="w-3 h-3 text-slate-400" />勤務時間</dt>
                  <dd className="text-slate-700">{proj.work_hours}</dd>
                </div>
              )}
              {proj.interview_count && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-400" />面談回数</dt>
                  <dd className="text-slate-700">{proj.interview_count}</dd>
                </div>
              )}
              {proj.required_experience_years && (
                <div>
                  <dt className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" />必要経験</dt>
                  <dd className="text-slate-700">{proj.required_experience_years}年以上</dd>
                </div>
              )}
              {proj.required_requirements && (
                <div>
                  <dt className="text-xs text-slate-500 mb-1">必須要件</dt>
                  <dd className="text-slate-700 text-xs whitespace-pre-wrap bg-slate-50 rounded-lg p-2">{proj.required_requirements}</dd>
                </div>
              )}
              {proj.description && (
                <div>
                  <dt className="text-xs text-slate-500 mb-1">案件概要</dt>
                  <dd className="text-slate-700 text-xs whitespace-pre-wrap">{proj.description}</dd>
                </div>
              )}
            </dl>
          ) : <p className="text-sm text-slate-400">案件情報なし</p>}
        </div>

        {/* パートナー情報（パートナー提案の場合のみ） */}
        {isPartner && (
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4" />提案元パートナー企業
            </h3>
            <dl className="space-y-3 text-sm">
              {proposal.partner_company_name && (
                <div>
                  <dt className="text-xs text-purple-600 mb-0.5">会社名</dt>
                  <dd className="font-medium text-slate-800">{proposal.partner_company_name}</dd>
                </div>
              )}
              {proposal.partner_contact_name && (
                <div>
                  <dt className="text-xs text-purple-600 mb-0.5 flex items-center gap-1"><User className="w-3 h-3" />担当者名</dt>
                  <dd className="text-slate-800">{proposal.partner_contact_name}</dd>
                </div>
              )}
              {proposal.partner_contact_email && (
                <div>
                  <dt className="text-xs text-purple-600 mb-0.5 flex items-center gap-1"><Mail className="w-3 h-3" />メールアドレス</dt>
                  <dd>
                    <a href={`mailto:${proposal.partner_contact_email}`} className="text-blue-600 hover:underline">
                      {proposal.partner_contact_email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* 提案管理 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">提案管理</h3>
          <dl className="space-y-3 text-sm">
            {proposal.next_action_at && (
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">次アクション期日</dt>
                <dd className="font-medium text-slate-800">{new Date(proposal.next_action_at).toLocaleDateString('ja-JP')}</dd>
              </div>
            )}
            {proposal.next_action_note && (
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">次アクションメモ</dt>
                <dd className="text-slate-700">{proposal.next_action_note}</dd>
              </div>
            )}
            {proposal.contract_start_date && (
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">契約開始日</dt>
                <dd className="text-slate-700">{new Date(proposal.contract_start_date).toLocaleDateString('ja-JP')}</dd>
              </div>
            )}
            {proposal.contract_end_date && (
              <div>
                <dt className="text-xs text-slate-500 mb-0.5">契約終了日</dt>
                <dd className="text-slate-700">{new Date(proposal.contract_end_date).toLocaleDateString('ja-JP')}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-500 mb-0.5">最終更新</dt>
              <dd className="text-slate-500 text-xs">{new Date(proposal.updated_at).toLocaleString('ja-JP')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
