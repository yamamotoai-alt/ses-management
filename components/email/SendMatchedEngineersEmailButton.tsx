'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, X, Loader2, CheckCircle, Sparkles, AlertCircle } from 'lucide-react'
import { Project, PartnerCompany } from '@/types'

interface MatchResult {
  id: string
  name: string
  score: number
  rank: string
}

interface Props {
  project: Project
}

export default function SendMatchedEngineersEmailButton({ project }: Props) {
  const [open, setOpen] = useState(false)
  const [matched, setMatched] = useState<MatchResult[]>([])
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([])
  const [partners, setPartners] = useState<PartnerCompany[]>([])
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [useInitials, setUseInitials] = useState(true)
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{ id: string; ok: boolean }[]>([])
  const [error, setError] = useState('')

  async function openModal() {
    // マッチング結果をLocalStorageから取得
    try {
      const raw = localStorage.getItem(`matching_project_${project.id}`)
      if (raw) {
        const { results: res } = JSON.parse(raw)
        const list: MatchResult[] = (res ?? [])
          .filter((r: any) => r.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
        setMatched(list)
        setSelectedEngineers(list.map(r => r.id))
      } else {
        setMatched([])
        setSelectedEngineers([])
      }
    } catch {
      setMatched([])
      setSelectedEngineers([])
    }

    // 協業企業一覧を取得（案件出し or 両方）
    const supabase = createClient()
    const { data } = await supabase
      .from('partner_companies')
      .select('*')
      .not('email', 'is', null)
      .order('company_name')
    setPartners((data ?? []) as PartnerCompany[])
    setSelectedPartners([])
    setResults([])
    setError('')
    setOpen(true)
  }

  function toggleEngineer(id: string) {
    setSelectedEngineers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function togglePartner(id: string) {
    setSelectedPartners(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSend() {
    if (!selectedEngineers.length || !selectedPartners.length) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/send-matched-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'project_to_engineers',
          projectId: project.id,
          engineerIds: selectedEngineers,
          partnerIds: selectedPartners,
          useInitials,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.results ?? [])
      }
    } catch (e) {
      setError(String(e))
    }
    setSending(false)
  }

  const sentAll = results.length > 0

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="flex items-center gap-2 border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline">エンジニア紹介メール</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">マッチしたエンジニアを協業企業に紹介</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-medium text-slate-700 truncate">{project.name}</p>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {/* エンジニア選択 */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">紹介するエンジニア（AIマッチング結果）</p>
            {matched.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-5 text-center border border-slate-200 rounded-lg">
                <Sparkles className="w-7 h-7 text-slate-300" />
                <p className="text-sm text-slate-500">マッチング結果がありません</p>
                <p className="text-xs text-slate-400">先にAIマッチングを実行してください</p>
              </div>
            ) : (
              <>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={useInitials}
                    onChange={e => setUseInitials(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  イニシャルで送信する
                </label>
                <div className="space-y-1.5">
                  {matched.map(r => (
                    <label key={r.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selectedEngineers.includes(r.id) ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input type="checkbox" checked={selectedEngineers.includes(r.id)} onChange={() => toggleEngineer(r.id)} className="w-4 h-4 rounded" />
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{r.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                        r.rank === 'S' ? 'bg-purple-100 text-purple-700' :
                        r.rank === 'A' ? 'bg-green-100 text-green-700' :
                        r.rank === 'B' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{r.rank} {r.score}%</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 協業企業選択 */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">送信先の協業企業</p>
            {partners.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">対象の協業企業がいません</p>
            ) : (
              <div className="space-y-1.5">
                {partners.map(p => {
                  const result = results.find(r => r.id === p.id)
                  return (
                    <label key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      result?.ok ? 'bg-green-50 border-green-200' :
                      result && !result.ok ? 'bg-red-50 border-red-200' :
                      selectedPartners.includes(p.id) ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      {result?.ok ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                       result && !result.ok ? <X className="w-4 h-4 text-red-500 flex-shrink-0" /> :
                       <input type="checkbox" checked={selectedPartners.includes(p.id)} onChange={() => togglePartner(p.id)} className="w-4 h-4 rounded" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{p.company_name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.email}</p>
                      </div>
                      {result?.ok && <span className="text-xs text-green-600 flex-shrink-0">送信済</span>}
                      {result && !result.ok && <span className="text-xs text-red-600 flex-shrink-0">失敗</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">{selectedPartners.length}社選択中</span>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-slate-600 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">閉じる</button>
            {!sentAll && (
              <button
                onClick={handleSend}
                disabled={selectedEngineers.length === 0 || selectedPartners.length === 0 || sending || matched.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" />送信中...</> : <><Mail className="w-4 h-4" />送信する</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
