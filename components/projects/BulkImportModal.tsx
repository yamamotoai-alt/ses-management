'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, CheckSquare, Square, AlertTriangle, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExtractedProject {
  name: string
  budget_min: number | null
  budget_max: number | null
  duration: string | null
  work_style: string | null
  work_location: string | null
  work_hours: string | null
  interview_count: string | null
  commercial_flow: string | null
  required_experience_years: number | null
  description: string | null
  required_languages: { name: string; years: number }[]
  required_frameworks: { name: string; years: number }[]
  required_cloud: { name: string; years: number }[]
  _duplicate?: boolean
  _hash?: string
}

interface Props {
  onClose: () => void
  onImported: () => void
}

function hashProject(p: ExtractedProject): string {
  const langs = p.required_languages.slice(0, 3).map(l => l.name).sort().join(',')
  return `${p.name}|${p.budget_max ?? ''}|${langs}`
}

export default function BulkImportModal({ onClose, onImported }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<ExtractedProject[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const supabase = createClient()

  async function handleAnalyze() {
    if (!text.trim()) return
    setLoading(true)
    setProjects([])
    setSelected(new Set())
    try {
      const res = await fetch('/api/extract-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const extracted: ExtractedProject[] = data.projects ?? []

      // 重複検知
      const hashes = extracted.map(hashProject)
      const { data: existing } = await supabase.from('projects').select('name, budget_max, required_languages')
      const existingHashes = new Set(
        (existing ?? []).map((p: { name: string; budget_max: number | null; required_languages: {name:string}[] }) => {
          const langs = (p.required_languages ?? []).slice(0, 3).map((l: {name:string}) => l.name).sort().join(',')
          return `${p.name}|${p.budget_max ?? ''}|${langs}`
        })
      )

      const marked = extracted.map((p, i) => ({
        ...p,
        _hash: hashes[i],
        _duplicate: existingHashes.has(hashes[i]),
      }))
      setProjects(marked)
      setSelected(new Set(marked.map((_, i) => i)))
    } catch (e) {
      alert('解析に失敗しました: ' + String(e))
    }
    setLoading(false)
  }

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function handleImport() {
    const toImport = projects.filter((_, i) => selected.has(i))
    if (toImport.length === 0) return
    setSaving(true)
    try {
      const rows = toImport.map(p => ({
        name: p.name,
        budget_min: p.budget_min,
        budget_max: p.budget_max,
        duration: p.duration,
        work_style: p.work_style,
        work_location: p.work_location,
        work_hours: p.work_hours,
        interview_count: p.interview_count,
        commercial_flow: p.commercial_flow,
        required_experience_years: p.required_experience_years,
        description: p.description,
        required_languages: p.required_languages ?? [],
        required_frameworks: p.required_frameworks ?? [],
        required_cloud: p.required_cloud ?? [],
        optional_languages: [],
        optional_frameworks: [],
        optional_cloud: [],
        status: 'draft',
        source: 'email_paste',
        raw_source_text: text,
      }))
      const { error } = await supabase.from('projects').insert(rows)
      if (error) throw new Error(error.message)
      onImported()
      onClose()
    } catch (e) {
      alert('登録に失敗しました: ' + String(e))
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">メール一括取り込み</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {projects.length === 0 ? (
            <>
              <p className="text-sm text-slate-600">案件メールの本文を貼り付けてください。複数案件まとめてOKです。</p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={10}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="案件メール本文をここに貼り付け..."
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />解析中...</> : <><Sparkles className="w-4 h-4" />AI解析</>}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{projects.length}件の案件を検出しました。取り込む案件を選択してください。</p>
                <button onClick={() => { setText(''); setProjects([]) }} className="text-xs text-slate-400 hover:text-slate-600">やり直す</button>
              </div>
              <div className="space-y-3">
                {projects.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => toggle(i)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selected.has(i) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {selected.has(i) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                          <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded font-medium">ドラフト</span>
                          {p._duplicate && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded font-medium">
                              <AlertTriangle className="w-3 h-3" />重複の可能性
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {(p.budget_min || p.budget_max) && (
                            <span>{p.budget_min?.toLocaleString() ?? '?'}〜{p.budget_max?.toLocaleString() ?? '?'}円/月</span>
                          )}
                          {p.work_style && <span>{p.work_style}</span>}
                          {p.duration && <span>{p.duration}</span>}
                        </div>
                        {p.required_languages.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.required_languages.slice(0, 4).map(l => (
                              <span key={l.name} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{l.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {projects.length > 0 && (
          <div className="p-6 border-t border-slate-200 flex gap-3">
            <button
              onClick={handleImport}
              disabled={saving || selected.size === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              選択した{selected.size}件をドラフト登録
            </button>
            <button onClick={onClose} className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm">キャンセル</button>
          </div>
        )}
      </div>
    </div>
  )
}
