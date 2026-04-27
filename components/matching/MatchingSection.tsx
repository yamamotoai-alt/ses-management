'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface MatchResult {
  id: string
  name: string
  score: number
  reason: string
}

interface Props {
  type: 'engineer' | 'project'
  id: string
}

export default function MatchingSection({ type, id }: Props) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function runMatching() {
    setLoading(true)
    setResults([])
    try {
      const res = await fetch(`/api/matching/${type}s/${id}`, { method: 'POST' })
      const data = await res.json()
      setResults(data.results ?? [])
      setDone(true)
    } catch {
      alert('マッチングに失敗しました')
    }
    setLoading(false)
  }

  const targetLabel = type === 'engineer' ? 'マッチする案件' : 'マッチするエンジニア'
  const linkBase = type === 'engineer' ? '/projects' : '/engineers'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 lg:sticky lg:top-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-slate-700 text-sm">AIマッチング</h3>
      </div>

      {!done ? (
        <div>
          <p className="text-xs text-slate-500 mb-4">
            {targetLabel}をAIが分析して提案します。スキル・単価・稼働形態などを考慮します。
          </p>
          <button
            onClick={runMatching}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-blue-400 disabled:to-blue-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />分析中...</>
            ) : (
              <><Sparkles className="w-4 h-4" />マッチング開始</>
            )}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-500 mb-3">{targetLabel}の提案 ({results.length}件)</p>
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">マッチする候補が見つかりませんでした</p>
          ) : (
            <div className="space-y-3">
              {results.map(result => (
                <Link
                  key={result.id}
                  href={`${linkBase}/${result.id}`}
                  className="block border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 truncate pr-2">
                      {result.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ScoreBadge score={result.score} />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3">{result.reason}</p>
                </Link>
              ))}
            </div>
          )}
          <button
            onClick={() => { setDone(false); setResults([]) }}
            className="mt-3 w-full text-xs text-slate-500 hover:text-slate-700 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            再実行
          </button>
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-700' :
    score >= 60 ? 'bg-blue-100 text-blue-700' :
    score >= 40 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${color}`}>
      {score}%
    </span>
  )
}
