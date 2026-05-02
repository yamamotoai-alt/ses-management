'use client'

import { useState } from 'react'
import { Proposal, ProposalStatus, PROPOSAL_STATUSES } from '@/types'
import { LayoutGrid, List, Clock, AlertCircle, ChevronRight, User, Briefcase, Building2 } from 'lucide-react'
import Link from 'next/link'
import AddProposalModal from './AddProposalModal'

interface Props {
  initialProposals: Proposal[]
  byStatus: Record<string, Proposal[]>
}

function daysDiff(dateStr: string | null): number {
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function isOverdue(p: Proposal): boolean {
  if (p.next_action_at) return daysDiff(p.next_action_at) > 3
  if (p.status === '結果待ち') return daysDiff(p.updated_at) > 3
  return false
}

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'パートナーからの提案') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded">
        <Building2 className="w-2.5 h-2.5" />パートナー
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">
      社内
    </span>
  )
}

function ProposalCard({ proposal, onStatusChange }: { proposal: Proposal; onStatusChange: (id: string, status: ProposalStatus) => void }) {
  const overdue = isOverdue(proposal)
  const eng = proposal.engineers
  const proj = proposal.projects
  const isPartner = proposal.channel === 'パートナーからの提案'

  return (
    <div className={`bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-all ${overdue ? 'border-red-300 bg-red-50' : isPartner ? 'border-purple-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <ChannelBadge channel={proposal.channel} />
            {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <Link href={`/engineers/${proposal.engineer_id}`} className="text-xs font-semibold text-slate-800 hover:text-blue-600 truncate">
              {eng?.name ?? '—'}
            </Link>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <Link href={`/projects/${proposal.project_id}`} className="text-xs text-slate-600 hover:text-blue-600 truncate">
              {proj?.name ?? '—'}
            </Link>
          </div>
          {isPartner && proposal.partner_company_name && (
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-purple-600 truncate">{proposal.partner_company_name}</span>
            </div>
          )}
        </div>
      </div>

      {proposal.next_action_at && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
          <Clock className="w-3 h-3" />
          <span>期日: {new Date(proposal.next_action_at).toLocaleDateString('ja-JP')}</span>
          {overdue && <span className="font-semibold">({daysDiff(proposal.next_action_at)}日超過)</span>}
        </div>
      )}

      <select
        value={proposal.status}
        onChange={e => onStatusChange(proposal.id, e.target.value as ProposalStatus)}
        className="mt-2 w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        onClick={e => e.stopPropagation()}
      >
        {PROPOSAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  '提案準備': 'bg-slate-100',
  '提案中': 'bg-blue-50',
  '面談調整中': 'bg-indigo-50',
  '面談済': 'bg-purple-50',
  '結果待ち': 'bg-yellow-50',
  '受注': 'bg-green-50',
  '稼働開始': 'bg-emerald-50',
  '終了予定': 'bg-orange-50',
  '終了': 'bg-slate-50',
}

const STATUS_HEADER_COLORS: Record<string, string> = {
  '提案準備': 'bg-slate-200 text-slate-700',
  '提案中': 'bg-blue-200 text-blue-800',
  '面談調整中': 'bg-indigo-200 text-indigo-800',
  '面談済': 'bg-purple-200 text-purple-800',
  '結果待ち': 'bg-yellow-200 text-yellow-800',
  '受注': 'bg-green-200 text-green-800',
  '稼働開始': 'bg-emerald-200 text-emerald-800',
  '終了予定': 'bg-orange-200 text-orange-800',
  '終了': 'bg-slate-200 text-slate-700',
}

export default function PipelineClient({ initialProposals }: Props) {
  const [proposals, setProposals] = useState(initialProposals)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [showAddModal, setShowAddModal] = useState(false)

  const byStatus = Object.fromEntries(
    PROPOSAL_STATUSES.map(s => [s, proposals.filter(p => p.status === s)])
  )

  async function handleStatusChange(id: string, status: ProposalStatus) {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  function handleAdded(proposal: Proposal) {
    setProposals(prev => [proposal, ...prev])
  }

  const overdueCount = proposals.filter(isOverdue).length
  const partnerCount = proposals.filter(p => p.channel === 'パートナーからの提案').length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
          >
            <LayoutGrid className="w-4 h-4" /> カンバン
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
          >
            <List className="w-4 h-4" /> 一覧
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + 提案追加
        </button>
        {partnerCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
            <Building2 className="w-4 h-4" />
            <span>パートナー提案: <strong>{partnerCount}件</strong></span>
          </div>
        )}
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>期日超過: <strong>{overdueCount}件</strong></span>
          </div>
        )}
      </div>

      {view === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PROPOSAL_STATUSES.map(status => (
              <div key={status} className={`w-56 rounded-xl ${STATUS_COLORS[status]} flex-shrink-0`}>
                <div className={`px-3 py-2 rounded-t-xl flex items-center justify-between ${STATUS_HEADER_COLORS[status]}`}>
                  <span className="text-xs font-semibold">{status}</span>
                  <span className="text-xs font-bold">{byStatus[status]?.length ?? 0}</span>
                </div>
                <div className="p-2 space-y-2 min-h-[100px]">
                  {(byStatus[status] ?? []).map(p => (
                    <ProposalCard key={p.id} proposal={p} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">チャネル</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">エンジニア</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">案件</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">提案企業</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">ステータス</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">次アクション期日</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map(p => {
                const overdue = isOverdue(p)
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 ${overdue ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <ChannelBadge channel={p.channel} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/engineers/${p.engineer_id}`} className="font-medium text-slate-800 hover:text-blue-600">
                        {p.engineers?.name ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <Link href={`/projects/${p.project_id}`} className="hover:text-blue-600">
                        {p.projects?.name ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {p.partner_company_name ? (
                        <div>
                          <div>{p.partner_company_name}</div>
                          {p.partner_contact_name && <div className="text-slate-400">{p.partner_contact_name}</div>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as ProposalStatus)}
                        className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {PROPOSAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {p.next_action_at ? (
                        <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                          {new Date(p.next_action_at).toLocaleDateString('ja-JP')}
                          {overdue && ` (${daysDiff(p.next_action_at)}日超過)`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </td>
                  </tr>
                )
              })}
              {proposals.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">提案データがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddProposalModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />
      )}
    </div>
  )
}
