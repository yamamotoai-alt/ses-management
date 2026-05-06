'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Engineer } from '@/types'
import { Mail, X, Loader2, CheckCircle } from 'lucide-react'
import { projectIntroEmail } from '@/lib/emailTemplates'

interface Props {
  project: Project
}

export default function SendProjectEmailModal({ project }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string[]>([])
  const [failed, setFailed] = useState<string[]>([])

  async function openModal() {
    const { data } = await supabase.from('engineers').select('*').eq('status', '待機中').not('email', 'is', null)
    setEngineers((data ?? []) as Engineer[])
    setSelected([])
    setDone([])
    setFailed([])
    setOpen(true)
  }

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSend() {
    setSending(true)
    const html = projectIntroEmail(project)
    const targets = engineers.filter(e => selected.includes(e.id))
    const results = await Promise.all(targets.map(async e => {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: e.email,
          toName: e.name,
          subject: `【案件紹介】${project.name}`,
          html,
        }),
      })
      const data = await res.json()
      return { id: e.id, ok: !data.error }
    }))
    setDone(results.filter(r => r.ok).map(r => r.id))
    setFailed(results.filter(r => !r.ok).map(r => r.id))
    setSending(false)
  }

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />エンジニアに紹介メール
      </button>
    )
  }

  const sentAll = done.length + failed.length === selected.length && selected.length > 0 && !sending

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">案件をエンジニアに紹介</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">{project.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">待機中でメールアドレスが登録済みのエンジニアが対象です</p>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {engineers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">対象エンジニアがいません</p>
          ) : (
            engineers.map(e => {
              const isDone = done.includes(e.id)
              const isFailed = failed.includes(e.id)
              return (
                <label key={e.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isDone ? 'bg-green-50 border-green-200' :
                  isFailed ? 'bg-red-50 border-red-200' :
                  selected.includes(e.id) ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  {isDone ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                   isFailed ? <X className="w-4 h-4 text-red-500 flex-shrink-0" /> :
                   <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} className="w-4 h-4 rounded" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{e.name}</p>
                    <p className="text-xs text-slate-500 truncate">{e.email}</p>
                  </div>
                  {isDone && <span className="text-xs text-green-600 flex-shrink-0">送信済</span>}
                  {isFailed && <span className="text-xs text-red-600 flex-shrink-0">失敗</span>}
                </label>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">{selected.length}名選択中</span>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-slate-600 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">閉じる</button>
            {!sentAll && (
              <button
                onClick={handleSend}
                disabled={selected.length === 0 || sending}
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
