'use client'

import { useState, useRef } from 'react'
import { Loader2, CheckCircle, Upload, FileText, X, Wand2 } from 'lucide-react'
import { SkillWithYears, WorkStyle, MONTHS } from '@/types'

function textToSkills(text: string): SkillWithYears[] {
  return text.split(/[\n,、・/／;；]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => ({ name: s, years: 1 }))
}

function skillsToText(items: SkillWithYears[]): string {
  return items.map(i => i.name).join('\n')
}

function SkillTextarea({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (text: string, items: SkillWithYears[]) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-slate-400 mb-1.5">カンマ・改行・スラッシュ等で区切って入力</p>
      <textarea
        rows={3}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value, textToSkills(e.target.value))}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  )
}

export default function IntakeForm() {
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [bulkSkillText, setBulkSkillText] = useState('')
  const [bulkClassifying, setBulkClassifying] = useState(false)

  const [form, setForm] = useState({
    name: '',
    initials: '',
    age: '',
    nearest_station: '',
    monthly_rate: '',
    work_style: '' as WorkStyle | '',
    available_from: '',
    email: '',
    phone: '',
    nationality: '',
    working_hours: '',
    desired_project: '',
    skill_summary: '',
    notes: '',
  })

  const [skillTexts, setSkillTexts] = useState({
    languages: '',
    frameworks: '',
    cloud_environments: '',
    db_skills: '',
    os_environments: '',
    tools: '',
    other_skills: '',
  })
  const [skills, setSkills] = useState({
    languages: [] as SkillWithYears[],
    frameworks: [] as SkillWithYears[],
    cloud_environments: [] as SkillWithYears[],
    db_skills: [] as SkillWithYears[],
    os_environments: [] as SkillWithYears[],
    tools: [] as SkillWithYears[],
    other_skills: [] as SkillWithYears[],
  })

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const setSkillField = (field: keyof typeof skillTexts) => (text: string, items: SkillWithYears[]) => {
    setSkillTexts(prev => ({ ...prev, [field]: text }))
    setSkills(prev => ({ ...prev, [field]: items }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)

    if (selected.type === 'application/pdf') {
      setPdfLoading(true)
      try {
        const fd = new FormData()
        fd.append('pdf', selected)
        const res = await fetch('/api/pdf-parse', { method: 'POST', body: fd })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.engineer) {
          const eng = data.engineer
          if (eng.name) set('name', eng.name)
          if (eng.age) set('age', eng.age.toString())
          if (eng.nearest_station) set('nearest_station', eng.nearest_station)
          if (eng.monthly_rate) set('monthly_rate', (eng.monthly_rate >= 1000 ? eng.monthly_rate / 10000 : eng.monthly_rate).toString())
          if (eng.work_style) set('work_style', eng.work_style)
          if (eng.skill_summary) set('skill_summary', eng.skill_summary)
          if (eng.available_from) set('available_from', eng.available_from)
          if (eng.languages?.length) {
            setSkillTexts(prev => ({ ...prev, languages: skillsToText(eng.languages) }))
            setSkills(prev => ({ ...prev, languages: eng.languages }))
          }
          if (eng.frameworks?.length) {
            setSkillTexts(prev => ({ ...prev, frameworks: skillsToText(eng.frameworks) }))
            setSkills(prev => ({ ...prev, frameworks: eng.frameworks }))
          }
          if (eng.cloud_environments?.length) {
            setSkillTexts(prev => ({ ...prev, cloud_environments: skillsToText(eng.cloud_environments) }))
            setSkills(prev => ({ ...prev, cloud_environments: eng.cloud_environments }))
          }
        }
      } catch {
        // 解析失敗時もファイルは保持
      }
      setPdfLoading(false)
    }
    e.target.value = ''
  }

  async function handleBulkClassify() {
    if (!bulkSkillText.trim()) return
    setBulkClassifying(true)
    try {
      const res = await fetch('/api/skill-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkSkillText }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const r = data.result
      const toItems = (arr: string[]) => arr.map((n: string) => ({ name: n, years: 1 }))
      if (r.languages?.length) {
        setSkillTexts(prev => ({ ...prev, languages: r.languages.join('\n') }))
        setSkills(prev => ({ ...prev, languages: toItems(r.languages) }))
      }
      if (r.frameworks?.length) {
        setSkillTexts(prev => ({ ...prev, frameworks: r.frameworks.join('\n') }))
        setSkills(prev => ({ ...prev, frameworks: toItems(r.frameworks) }))
      }
      if (r.cloud_environments?.length) {
        setSkillTexts(prev => ({ ...prev, cloud_environments: r.cloud_environments.join('\n') }))
        setSkills(prev => ({ ...prev, cloud_environments: toItems(r.cloud_environments) }))
      }
      if (r.db_skills?.length) {
        setSkillTexts(prev => ({ ...prev, db_skills: r.db_skills.join('\n') }))
        setSkills(prev => ({ ...prev, db_skills: toItems(r.db_skills) }))
      }
      if (r.os_environments?.length) {
        setSkillTexts(prev => ({ ...prev, os_environments: r.os_environments.join('\n') }))
        setSkills(prev => ({ ...prev, os_environments: toItems(r.os_environments) }))
      }
      if (r.tools?.length) {
        setSkillTexts(prev => ({ ...prev, tools: r.tools.join('\n') }))
        setSkills(prev => ({ ...prev, tools: toItems(r.tools) }))
      }
      if (r.other_skills?.length) {
        setSkillTexts(prev => ({ ...prev, other_skills: r.other_skills.join('\n') }))
        setSkills(prev => ({ ...prev, other_skills: toItems(r.other_skills) }))
      }
      setBulkSkillText('')
    } catch (e) {
      alert('スキル分類に失敗しました: ' + String(e))
    }
    setBulkClassifying(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"
  const req = <span className="text-red-500">*</span>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      alert('履歴書・職務経歴書をアップロードしてください')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('data', JSON.stringify({ ...form, ...skills }))
      fd.append('file', file)

      const res = await fetch('/api/intake', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? '送信に失敗しました')
      setSubmitted(true)
    } catch (e) {
      alert('送信に失敗しました: ' + String(e))
    }
    setSaving(false)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">ご登録ありがとうございます！</h2>
        <p className="text-slate-600 text-sm mb-6">
          続いて、担当者との面談日程をご調整ください。<br />
          下記のURLより、ご都合のよい日時をお選びいただけます。
        </p>
        <a
          href="https://timerex.net/s/nexusadvisors/8a95879a"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          面談の日程を調整する →
        </a>
        <p className="mt-4 text-xs text-slate-400">
          日程調整が完了次第、担当者よりご連絡いたします。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 書類アップロード（必須） */}
      <section className={`rounded-2xl border-2 p-6 ${file ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'}`}>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          履歴書・職務経歴書 <span className="text-red-500 font-bold">※必須</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">PDFをアップロードすると、情報を自動入力します。提出がない場合は登録できません。</p>

        {file ? (
          <div className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-3">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
            {pdfLoading && <><Loader2 className="w-4 h-4 animate-spin text-blue-500" /><span className="text-xs text-blue-600">解析中...</span></>}
            {!pdfLoading && (
              <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-white border-2 border-red-300 text-red-700 text-sm px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors font-medium"
          >
            <Upload className="w-4 h-4" />
            ファイルを選択（必須）
          </button>
        )}
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls" onChange={handleFileChange} />
        <p className="mt-2 text-xs text-slate-400">対応形式: PDF, Word, Excel</p>
      </section>

      {pdfLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          PDFを解析してフォームに自動入力しています...
        </div>
      )}

      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">基本情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>氏名 {req}</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="山田 太郎" />
          </div>
          <div>
            <label className={labelClass}>イニシャル {req}</label>
            <input type="text" required value={form.initials} onChange={e => set('initials', e.target.value)} className={inputClass} placeholder="例: Y.T." maxLength={20} />
          </div>
          <div>
            <label className={labelClass}>年齢 {req}</label>
            <input type="number" required value={form.age} onChange={e => set('age', e.target.value)} className={inputClass} min={18} max={80} placeholder="例: 30" />
          </div>
          <div>
            <label className={labelClass}>最寄り駅 / お住まいの地域 {req}</label>
            <input type="text" required value={form.nearest_station} onChange={e => set('nearest_station', e.target.value)} className={inputClass} placeholder="例: 渋谷、大阪市" />
          </div>
          <div>
            <label className={labelClass}>ご希望単価（万円/月）{req}</label>
            <input type="number" required value={form.monthly_rate} onChange={e => set('monthly_rate', e.target.value)} className={inputClass} step={0.5} placeholder="例: 60" />
          </div>
          <div>
            <label className={labelClass}>稼働形態 {req}</label>
            <select required value={form.work_style} onChange={e => set('work_style', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              <option value="フルリモート">フルリモート</option>
              <option value="ハイブリッド">ハイブリッド（一部出社）</option>
              <option value="常駐">常駐（フル出社）</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>参画可能時期 {req}</label>
            <select required value={form.available_from} onChange={e => set('available_from', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>稼働時間 {req}</label>
            <input type="text" required value={form.working_hours} onChange={e => set('working_hours', e.target.value)} className={inputClass} placeholder="例: 1人月" />
          </div>
          <div>
            <label className={labelClass}>メールアドレス {req}</label>
            <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="taro@example.com" />
          </div>
          <div>
            <label className={labelClass}>電話番号 {req}</label>
            <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="090-1234-5678" />
          </div>
          <div>
            <label className={labelClass}>国籍 {req}</label>
            <input type="text" required value={form.nationality} onChange={e => set('nationality', e.target.value)} className={inputClass} placeholder="例: 日本" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>希望案件・ご要望 {req}</label>
            <input type="text" required value={form.desired_project} onChange={e => set('desired_project', e.target.value)} className={inputClass} placeholder="例: 週一出社可能" />
          </div>
        </div>
      </section>

      {/* スキル情報 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">スキル情報</h3>
        <div className="space-y-5">
          {/* スキル一括入力 */}
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <p className="text-sm font-medium text-violet-800 mb-1 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />AIスキル自動分類
            </p>
            <p className="text-xs text-violet-600 mb-2">スキルをまとめて入力するとAIが自動でカテゴリに振り分けます</p>
            <textarea
              value={bulkSkillText}
              onChange={e => setBulkSkillText(e.target.value)}
              rows={3}
              className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              placeholder={"例: PHP JavaScript TypeScript HTML CSS MySQL AWS Docker Git"}
            />
            <button
              type="button"
              onClick={handleBulkClassify}
              disabled={bulkClassifying || !bulkSkillText.trim()}
              className="mt-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {bulkClassifying ? <><Loader2 className="w-4 h-4 animate-spin" />分類中...</> : <><Wand2 className="w-4 h-4" />自動分類する</>}
            </button>
          </div>
          <SkillTextarea required label="プログラミング言語" placeholder="Java, Python, TypeScript" value={skillTexts.languages} onChange={setSkillField('languages')} />
          <SkillTextarea label="フレームワーク" placeholder="Spring Boot, React, Next.js" value={skillTexts.frameworks} onChange={setSkillField('frameworks')} />
          <SkillTextarea label="クラウド環境" placeholder="AWS, GCP, Azure" value={skillTexts.cloud_environments} onChange={setSkillField('cloud_environments')} />
          <SkillTextarea label="DB" placeholder="MySQL, PostgreSQL, Oracle" value={skillTexts.db_skills} onChange={setSkillField('db_skills')} />
          <SkillTextarea label="OS" placeholder="Linux, Windows, macOS" value={skillTexts.os_environments} onChange={setSkillField('os_environments')} />
          <SkillTextarea label="ツール・その他環境" placeholder="Docker, Jenkins, GitHub" value={skillTexts.tools} onChange={setSkillField('tools')} />
          <SkillTextarea label="その他スキル" placeholder="Agile, Scrum, ビジネス英語" value={skillTexts.other_skills} onChange={setSkillField('other_skills')} />
          <div>
            <label className={labelClass}>自己PR・スキル概要 {req}</label>
            <textarea
              required
              value={form.skill_summary}
              onChange={e => set('skill_summary', e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="これまでの経験・得意なことなどを自由にご記入ください"
            />
          </div>
        </div>
      </section>

      {/* 備考 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">その他</h3>
        <div>
          <label className={labelClass}>備考・その他ご連絡事項</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="その他、ご自由にお書きください"
          />
        </div>
      </section>

      <div className="pb-8">
        <button
          type="submit"
          disabled={saving || pdfLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? '送信中...' : '送信する'}
        </button>
        <p className="text-xs text-slate-400 text-center mt-3">
          送信いただいた情報は担当者が確認し、ご連絡いたします。
        </p>
      </div>
    </form>
  )
}
