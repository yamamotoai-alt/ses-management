'use client'

import { useState } from 'react'
import { Mail, X, Loader2, CheckCircle, Sparkles, AlertCircle } from 'lucide-react'
import { Engineer } from '@/types'

interface MatchResult {
  id: string
  name: string
  score: number
  rank: string
}

interface Props {
  engineer: Engineer
}

export default function SendMatchedProjectsEmailButton({ engineer }: Props) {
  const [open, setOpen] = useState(false)
  const [matched, setMatched] = useState<MatchResult[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function openModal() {
    try {
      const raw = localStorage.getItem(`matching_engineer_${engineer.id}`)
      if (raw) {
        const { results } = JSON.parse(raw)
        const list: MatchResult[] = (results ?? [])
          .filter((r: any) => r.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
        setMatched(list)
        setSelected(list.map(r => r.id))
      } else {
        setMatched([])
        setSelected([])
      }
    } catch {
      setMatched([])
      setSelected([])
    }
    setSent(false)
    setError('')
    setOpen(true)
  }

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSend() {
    if (!selected.length) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/send-matched-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'engineer_to_projects',
          engineerId: engineer.id,
          projectIds: selected,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(`送信失敗: ${data.error}`)
      } else {
        setSent(true)
      }
    } catch (e) {
      setError(`通信エラー: ${String(e)}`)
    }
    setSending(false)
  }

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="flex items-center gap-2 border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline">案件紹介メール</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">マッチした案件を紹介メール送信</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">{engineer.name} 宛に送信</p>
          {engineer.email
            ? <p className="text-xs text-slate-500 mt-0.5 truncate">{engineer.email}</p>
            : <p className="text-xs text-red-500 mt-0.5 font-medium">メールアドレスが登録されていません</p>
          }
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {matched.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Sparkles className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">マッチング結果がありません</p>
              <p className="text-xs text-slate-400">先にAIマッチングを実行してください</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">送信する案件を選択（AIマッチング結果）</p>
              {matched.map(r => (
                <label key={r.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected.includes(r.id) ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} className="w-4 h-4 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    r.rank === 'S' ? 'bg-purple-100 text-purple-700' :
                    r.rank === 'A' ? 'bg-green-100 text-green-700' :
                    r.rank === 'B' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{r.rank} {r.score}%</span>
                </label>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">{selected.length}件選択中</span>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-slate-600 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">閉じる</button>
            {sent ? (
              <span className="flex items-center gap-2 text-sm text-green-600 font-medium px-4 py-2">
                <CheckCircle className="w-4 h-4" />送信完了
              </span>
            ) : (
              <button
                onClick={handleSend}
                disabled={selected.length === 0 || sending || matched.length === 0 || !engineer.email}
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
