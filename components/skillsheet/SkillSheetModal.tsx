'use client'

import { useState } from 'react'
import { Engineer } from '@/types'
import { X, Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'

interface Props {
  engineer: Engineer
  onClose: () => void
}

type AnonLevel = 'none' | 'initials' | 'initials_no_age' | 'full'
type Format = 'pdf' | 'excel'

export default function SkillSheetModal({ engineer, onClose }: Props) {
  const [format, setFormat] = useState<Format>('pdf')
  const [anonLevel, setAnonLevel] = useState<AnonLevel>('initials')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [excludeRate, setExcludeRate] = useState(true)
  const [excludeSales, setExcludeSales] = useState(true)
  const [excludeTopSales, setExcludeTopSales] = useState(true)
  const [loading, setLoading] = useState(false)

  const allSkills = [
    ...engineer.languages.map(l => l.name),
    ...engineer.frameworks.map(f => f.name),
    ...engineer.cloud_environments.map(c => c.name),
  ]

  function toggleSkill(name: string) {
    setSelectedSkills(prev =>
      prev.includes(name)
        ? prev.filter(s => s !== name)
        : prev.length < 5 ? [...prev, name] : prev
    )
  }

  function maskedName() {
    if (anonLevel === 'none') return engineer.name
    if (engineer.initials) return engineer.initials
    const parts = engineer.name.split(/\s+/)
    return parts.map(p => p[0] + '.').join('')
  }

  async function handleDownload() {
    setLoading(true)
    try {
      const payload = { engineer, format, anonLevel, selectedSkills, excludeRate, excludeSales, excludeTopSales }
      const res = await fetch('/api/skillsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('生成失敗')
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const namePart = anonLevel === 'none' ? engineer.name : maskedName()

      if (format === 'pdf') {
        const html = await res.text()
        const win = window.open('', '_blank')
        if (!win) { alert('ポップアップを許可してください'); setLoading(false); return }
        win.document.write(html)
        win.document.close()
        win.onload = () => { win.focus(); win.print() }
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `スキルシート_${namePart}_${today}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      alert('ダウンロードに失敗しました: ' + String(e))
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">スキルシート出力</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* フォーマット */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">フォーマット</label>
            <div className="flex gap-3">
              {([['pdf', 'PDF', FileText], ['excel', 'Excel', FileSpreadsheet]] as const).map(([val, label, Icon]) => (
                <button
                  key={val}
                  onClick={() => setFormat(val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                    format === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          {/* 匿名化レベル */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">匿名化レベル</label>
            <div className="space-y-2">
              {([
                ['none', 'なし（氏名そのまま）'],
                ['initials', 'イニシャルのみ'],
                ['initials_no_age', 'イニシャル＋年齢非表示'],
                ['full', '完全匿名（氏名・年齢・地域すべて非表示）'],
              ] as const).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="anon"
                    value={val}
                    checked={anonLevel === val}
                    onChange={() => setAnonLevel(val)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            {anonLevel !== 'none' && (
              <p className="mt-1 text-xs text-slate-500">表示名: <strong>{maskedName()}</strong></p>
            )}
          </div>

          {/* 強調スキル */}
          {allSkills.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                強調スキル（最大5つ）
              </label>
              <p className="text-xs text-slate-500 mb-2">選択したスキルをシート上部にハイライト表示します</p>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 除外項目 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">除外項目</label>
            <div className="space-y-2">
              {[
                [excludeRate, setExcludeRate, '単価を除外'],
                [excludeSales, setExcludeSales, '営業担当者を除外'],
                [excludeTopSales, setExcludeTopSales, '上位営業先を除外'],
              ].map(([val, setter, label]) => (
                <label key={label as string} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val as boolean}
                    onChange={e => (setter as (v: boolean) => void)(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{label as string}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            ダウンロード
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
