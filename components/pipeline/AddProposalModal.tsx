'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Proposal, ProposalStatus, PROPOSAL_STATUSES } from '@/types'

interface Props {
  onClose: () => void
  onAdded: (proposal: Proposal) => void
  defaultEngineerId?: string
  defaultProjectId?: string
}

export default function AddProposalModal({ onClose, onAdded, defaultEngineerId, defaultProjectId }: Props) {
  const supabase = createClient()
  const [engineers, setEngineers] = useState<{id:string;name:string}[]>([])
  const [projects, setProjects] = useState<{id:string;name:string}[]>([])
  const [engineerId, setEngineerId] = useState(defaultEngineerId ?? '')
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [status, setStatus] = useState<ProposalStatus>('提案準備')
  const [nextActionAt, setNextActionAt] = useState('')
  const [nextActionNote, setNextActionNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('engineers').select('id, name').order('name').then(({ data }) => setEngineers(data ?? []))
    supabase.from('projects').select('id, name').neq('status', '終了').order('name').then(({ data }) => setProjects(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!engineerId || !projectId) return
    setSaving(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineer_id: engineerId,
          project_id: projectId,
          status,
          next_action_at: nextActionAt || null,
          next_action_note: nextActionNote || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onAdded(data.proposal)
      onClose()
    } catch (e) {
      alert('登録に失敗しました: ' + String(e))
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">提案追加</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">エンジニア <span className="text-red-500">*</span></label>
            <select value={engineerId} onChange={e => setEngineerId(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">選択してください</option>
              {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">案件 <span className="text-red-500">*</span></label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">選択してください</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ステータス</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProposalStatus)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {PROPOSAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">次アクション期日</label>
            <input type="date" value={nextActionAt} onChange={e => setNextActionAt(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">次アクションメモ</label>
            <input type="text" value={nextActionNote} onChange={e => setNextActionNote(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="例: 面談日程調整メール送付" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}登録する
            </button>
            <button type="button" onClick={onClose} className="px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm">キャンセル</button>
          </div>
        </form>
      </div>
    </div>
  )
}
