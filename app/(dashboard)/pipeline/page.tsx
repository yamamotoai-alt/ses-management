export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import PipelineClient from '@/components/pipeline/PipelineClient'
import { Proposal, PROPOSAL_STATUSES } from '@/types'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proposals')
    .select('*, engineers(id, name, status, monthly_rate, work_style, available_from, languages, frameworks, cloud_environments), projects(id, name, status, budget_min, budget_max, required_languages, work_style)')
    .order('created_at', { ascending: false })

  const proposals = (data ?? []) as Proposal[]

  const byStatus = Object.fromEntries(
    PROPOSAL_STATUSES.map(s => [s, proposals.filter(p => p.status === s)])
  )

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">提案パイプライン</h2>
        <p className="text-slate-500 text-sm mt-1">エンジニア×案件の提案ステータス管理</p>
      </div>
      <PipelineClient initialProposals={proposals} byStatus={byStatus} />
    </div>
  )
}
