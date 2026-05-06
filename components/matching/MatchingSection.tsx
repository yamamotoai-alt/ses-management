'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, ChevronRight, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface ScoreBreakdown {
  score: number
  max_score: number
  reason: string
}

interface MatchResult {
  id: string
  name: string
  score: number
  rank: string
  recommendation: string
  summary: string
  reason: string
  matched_points: string[]
  concerns: string[]
  proposal_talk_track: string
  score_breakdown: Record<string, ScoreBreakdown>
}

interface Props {
  type: 'engineer' | 'project'
  id: string
}

const RANK_LABELS: Record<string, { label: string; color: string }> = {
  S: { label: 'S', color: 'bg-purple-100 text-purple-700' },
  A: { label: 'A', color: 'bg-green-100 text-green-700' },
  B: { label: 'B', color: 'bg-blue-100 text-blue-700' },
  C: { label: 'C', color: 'bg-yellow-100 text-yellow-700' },
  D: { label: 'D', color: 'bg-orange-100 text-orange-700' },
  E: { label: 'E', color: 'bg-red-100 text-red-700' },
}

const BREAKDOWN_LABELS: Record<string, string> = {
  required_skill_match: '必須スキル',
  preferred_skill_match: '歓迎スキル',
  price_match: '単価・予算',
  work_style_and_location_match: '稼働形態・場所',
  availability_match: '参画タイミング',
  career_and_project_fit: '希望・キャリア',
  business_risk_match: '提案リスク',
}

function normalize(r: any): MatchResult {
  return {
    id: r.id ?? '',
    name: r.name ?? r.engineer_name_or_identifier ?? '',
    score: r.matching_score ?? r.score ?? 0,
    rank: r.matching_rank ?? r.rank ?? '',
    recommendation: r.recommendation ?? '',
    summary: r.summary ?? '',
    reason: r.final_judgement ?? r.reason ?? r.summary ?? '',
    matched_points: r.matched_points ?? [],
    concerns: r.concerns ?? [],
    proposal_talk_track: r.proposal_talk_track ?? '',
    score_breakdown: r.score_breakdown ?? {},
  }
}

const STORAGE_KEY = (type: string, id: string) => `matching_${type}_${id}`

export default function MatchingSection({ type, id }: Props) {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [progress, setProgress] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(type, id))
      if (saved) {
        const { results: savedResults } = JSON.parse(saved)
        if (savedResults?.length) {
          setResults(savedResults)
          setDone(true)
        }
      }
    } catch {}
  }, [type, id])

  async function runMatching() {
    setLoading(true)
    setResults([])
    setExpanded(null)
    setDone(false)
    setProgress('')
    try { localStorage.removeItem(STORAGE_KEY(type, id)) } catch {}

    let page = 0
    let hasMore = true
    const allResults: MatchResult[] = []

    try {
      while (hasMore) {
        setProgress(`分析中... (${page + 1}件目)`)
        const res = await fetch(`/api/matching/${type}s/${id}?page=${page}`, { method: 'POST' })
        if (!res.ok) break
        const data = await res.json()
        const chunk: MatchResult[] = (data.results ?? []).map(normalize)
        allResults.push(...chunk)
        allResults.sort((a, b) => b.score - a.score)
        setResults([...allResults])
        try { localStorage.setItem(STORAGE_KEY(type, id), JSON.stringify({ results: allResults })) } catch {}
        hasMore = data.hasMore === true
        page++
      }
    } catch {
      if (allResults.length === 0) {
        alert('マッチングに失敗しました')
      }
    }

    setProgress('')
    setDone(true)
    setLoading(false)
  }

  const targetLabel = type === 'engineer' ? 'マッチする案件' : 'マッチするエンジニア'
  const linkBase = type === 'engineer' ? '/projects' : '/engineers'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 lg:sticky lg:top-6 flex flex-col" style={{ maxHeight: '80vh' }}>
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-slate-700 text-sm">AIマッチング</h3>
        {results.length > 0 && (
          <span className="ml-auto text-xs text-slate-400">{results.length}件</span>
        )}
      </div>

      {!done && !loading ? (
        <div className="flex-shrink-0">
          <p className="text-xs text-slate-500 mb-4">
            {targetLabel}をAIが分析して提案します。スキル・単価・稼働形態・商流などを総合的に評価します。
          </p>
          <button
            onClick={runMatching}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />マッチング開始
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {loading && (
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{progress || '分析中...'}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-0.5">
              {results.map(result => {
                const isOpen = expanded === result.id
                const rankInfo = RANK_LABELS[result.rank] ?? { label: result.rank, color: 'bg-slate-100 text-slate-600' }
                return (
                  <div key={result.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : result.id)}
                    >
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${rankInfo.color}`}>
                        {rankInfo.label}
                      </span>
                      <span className="text-xs font-bold text-slate-700 flex-shrink-0">{result.score}%</span>
                      <Link
                        href={`${linkBase}/${result.id}`}
                        className="flex-1 text-xs font-medium text-slate-800 hover:text-blue-600 truncate"
                        onClick={e => e.stopPropagation()}
                      >
                        {result.name}
                      </Link>
                      <div className="flex-shrink-0">
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50 text-xs">
                        {result.summary && (
                          <p className="text-slate-600">{result.summary}</p>
                        )}

                        {result.score_breakdown && Object.keys(result.score_breakdown).length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-600 mb-1.5">スコア内訳</p>
                            <div className="space-y-1">
                              {Object.entries(result.score_breakdown).map(([key, val]) => (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-slate-500">{BREAKDOWN_LABELS[key] ?? key}</span>
                                    <span className="font-medium text-slate-700">{val.score}/{val.max_score}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-1">
                                    <div
                                      className={`h-1 rounded-full ${val.score / val.max_score >= 0.8 ? 'bg-green-500' : val.score / val.max_score >= 0.5 ? 'bg-blue-400' : 'bg-orange-400'}`}
                                      style={{ width: `${(val.score / val.max_score) * 100}%` }}
                                    />
                                  </div>
                                  {val.reason && <p className="text-slate-400 mt-0.5">{val.reason}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.matched_points.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-600 mb-1">マッチポイント</p>
                            <ul className="space-y-0.5">
                              {result.matched_points.map((pt, i) => (
                                <li key={i} className="flex items-start gap-1 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />{pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.concerns.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-600 mb-1">懸念点</p>
                            <ul className="space-y-0.5">
                              {result.concerns.map((c, i) => (
                                <li key={i} className="flex items-start gap-1 text-orange-700">
                                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.proposal_talk_track && result.proposal_talk_track !== '本案件は条件不一致のため、提案対象外です。' && (
                          <div>
                            <p className="font-semibold text-slate-600 mb-1">提案文</p>
                            <p className="text-slate-600 whitespace-pre-wrap bg-white border border-slate-200 rounded p-2">{result.proposal_talk_track}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {loading && results.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">分析中です。しばらくお待ちください...</p>
          )}

          {done && results.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">マッチする候補が見つかりませんでした</p>
          )}

          {done && (
            <button
              onClick={() => { setDone(false); setResults([]); setExpanded(null) }}
              className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              再実行
            </button>
          )}
        </div>
      )}
    </div>
  )
}
