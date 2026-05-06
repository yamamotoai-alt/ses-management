'use client'

import { useState, useRef, useEffect } from 'react'
import { Engineer } from '@/types'
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react'

interface Props {
  engineer: Engineer
  onClose: () => void
}

export default function SummaryModal({ engineer, onClose }: Props) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    generate()
  }, [])

  async function generate() {
    setLoading(true)
    setError('')
    setSummary('')
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineer }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSummary(data.summary)
      }
    } catch (e) {
      setError(String(e))
    }
    setLoading(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      textRef.current?.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">サマリー出力</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">AIがサマリーを生成中...</p>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          ) : (
            <textarea
              ref={textRef}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full min-h-[480px] text-sm text-slate-800 font-mono bg-slate-50 border border-slate-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!summary || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {copied ? <><Check className="w-4 h-4" />コピー完了</> : <><Copy className="w-4 h-4" />テキストをコピー</>}
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />再生成
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
