'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Engineer, SkillWithYears, WorkStyle, MONTHS, CLOUD_OPTIONS, LANGUAGE_OPTIONS, FRAMEWORK_OPTIONS } from '@/types'
import { Plus, X, Upload, Loader2, FileText } from 'lucide-react'

interface Props {
  engineer?: Engineer
}

function SkillInput({
  items,
  onChange,
  options,
  label,
}: {
  items: SkillWithYears[]
  onChange: (items: SkillWithYears[]) => void
  options: string[]
  label: string
}) {
  const addItem = () => onChange([...items, { name: '', years: 1 }])
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof SkillWithYears, value: string | number) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    onChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <select
              value={item.name}
              onChange={e => updateItem(i, 'name', e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input
              type="number"
              value={item.years}
              onChange={e => updateItem(i, 'years', Number(e.target.value))}
              min={1}
              max={30}
              className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="年数"
            />
            <span className="flex items-center text-sm text-slate-500">年</span>
            <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> {label}を追加
        </button>
      </div>
    </div>
  )
}

export default function EngineerForm({ engineer }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [textLoading, setTextLoading] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)

  const [form, setForm] = useState({
    name: engineer?.name ?? '',
    initials: engineer?.initials ?? '',
    age: engineer?.age?.toString() ?? '',
    nearest_station: engineer?.nearest_station ?? '',
    monthly_rate: engineer?.monthly_rate?.toString() ?? '',
    work_style: (engineer?.work_style ?? '') as WorkStyle | '',
    available_from: engineer?.available_from ?? '',
    skill_summary: engineer?.skill_summary ?? '',
    status: engineer?.status ?? '待機中',
    top_sales_target: engineer?.top_sales_target ?? '',
    interview_person: engineer?.interview_person ?? '',
    sales_person: engineer?.sales_person ?? '',
  })
  const [languages, setLanguages] = useState<SkillWithYears[]>(engineer?.languages ?? [])
  const [frameworks, setFrameworks] = useState<SkillWithYears[]>(engineer?.frameworks ?? [])
  const [cloudEnvs, setCloudEnvs] = useState<SkillWithYears[]>(engineer?.cloud_environments ?? [])

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfLoading(true)
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const res = await fetch('/api/pdf-parse', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.engineer) {
        const eng = data.engineer
        if (eng.name) set('name', eng.name)
        if (eng.age) set('age', eng.age.toString())
        if (eng.nearest_station) set('nearest_station', eng.nearest_station)
        if (eng.monthly_rate) set('monthly_rate', eng.monthly_rate.toString())
        if (eng.work_style) set('work_style', eng.work_style)
        if (eng.skill_summary) set('skill_summary', eng.skill_summary)
        if (eng.available_from) set('available_from', eng.available_from)
        if (eng.languages?.length) setLanguages(eng.languages)
        if (eng.frameworks?.length) setFrameworks(eng.frameworks)
        if (eng.cloud_environments?.length) setCloudEnvs(eng.cloud_environments)
      }
    } catch {
      alert('PDFの解析に失敗しました')
    }
    setPdfLoading(false)
  }

  async function handleTextParse() {
    if (!pasteText.trim()) return
    setTextLoading(true)
    try {
      const res = await fetch('/api/text-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText, type: 'engineer' }),
      })
      const data = await res.json()
      if (data.result) {
        const r = data.result
        if (r.name) set('name', r.name)
        if (r.age) set('age', r.age.toString())
        if (r.nearest_station) set('nearest_station', r.nearest_station)
        if (r.monthly_rate) set('monthly_rate', r.monthly_rate.toString())
        if (r.work_style) set('work_style', r.work_style)
        if (r.skill_summary) set('skill_summary', r.skill_summary)
        if (r.available_from) set('available_from', r.available_from)
        if (r.languages?.length) setLanguages(r.languages)
        if (r.frameworks?.length) setFrameworks(r.frameworks)
        if (r.cloud_environments?.length) setCloudEnvs(r.cloud_environments)
        setPasteText('')
        setShowTextInput(false)
      }
    } catch {
      alert('テキストの解析に失敗しました')
    }
    setTextLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      initials: form.initials || null,
      age: form.age ? Number(form.age) : null,
      nearest_station: form.nearest_station || null,
      monthly_rate: form.monthly_rate ? Number(form.monthly_rate) : null,
      work_style: form.work_style || null,
      available_from: form.available_from || null,
      skill_summary: form.skill_summary || null,
      status: form.status,
      top_sales_target: form.top_sales_target || null,
      interview_person: form.interview_person || null,
      sales_person: form.sales_person || null,
      languages,
      frameworks,
      cloud_environments: cloudEnvs,
    }

    let error
    if (engineer) {
      ;({ error } = await supabase.from('engineers').update(payload).eq('id', engineer.id))
    } else {
      ;({ error } = await supabase.from('engineers').insert(payload))
    }

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      router.push('/engineers')
      router.refresh()
    }
    setSaving(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* AI自動入力 */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          AIによる自動入力
        </h3>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" disabled={pdfLoading || textLoading} />
            <span className="bg-white border border-blue-300 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
              {pdfLoading ? <><Loader2 className="w-4 h-4 animate-spin" />解析中...</> : <><Upload className="w-4 h-4" />PDFから入力</>}
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowTextInput(v => !v)}
            disabled={pdfLoading || textLoading}
            className="bg-white border border-blue-300 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />テキストから入力
          </button>
        </div>
        {showTextInput && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-blue-600">エンジニア情報のテキストを貼り付けてください（メール文面・メモ等）</p>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={6}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="例：&#10;山田太郎、35歳&#10;最寄り駅：渋谷&#10;単価：70万円/月&#10;Java 8年、Spring Boot 5年&#10;AWS 3年&#10;フルリモート希望&#10;来月から参画可能"
            />
            <button
              type="button"
              onClick={handleTextParse}
              disabled={textLoading || !pasteText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {textLoading ? <><Loader2 className="w-4 h-4 animate-spin" />解析中...</> : <>AIで抽出する</>}
            </button>
          </div>
        )}
      </div>

      {/* 基本情報 */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">基本情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>氏名 <span className="text-red-500">*</span></label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>イニシャル</label>
            <input type="text" value={form.initials} onChange={e => set('initials', e.target.value)} className={inputClass} placeholder="例: Y.T." maxLength={20} />
          </div>
          <div>
            <label className={labelClass}>年齢</label>
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className={inputClass} min={18} max={80} />
          </div>
          <div>
            <label className={labelClass}>最寄り駅/地域</label>
            <input type="text" value={form.nearest_station} onChange={e => set('nearest_station', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>単価（円/月）</label>
            <input type="number" value={form.monthly_rate} onChange={e => set('monthly_rate', e.target.value)} className={inputClass} step={10000} />
          </div>
          <div>
            <label className={labelClass}>ステータス</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
              <option value="待機中">待機中</option>
              <option value="稼働中">稼働中</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>稼働形態</label>
            <select value={form.work_style} onChange={e => set('work_style', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              <option value="フルリモート">フルリモート</option>
              <option value="ハイブリッド">ハイブリッド</option>
              <option value="常駐">常駐</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>参画タイミング</label>
            <select value={form.available_from} onChange={e => set('available_from', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* スキル */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">スキル情報</h3>
        <div className="space-y-6">
          <SkillInput items={languages} onChange={setLanguages} options={LANGUAGE_OPTIONS} label="言語" />
          <SkillInput items={frameworks} onChange={setFrameworks} options={FRAMEWORK_OPTIONS} label="フレームワーク" />
          <SkillInput items={cloudEnvs} onChange={setCloudEnvs} options={CLOUD_OPTIONS} label="クラウド環境" />
          <div>
            <label className={labelClass}>スキル概要</label>
            <textarea value={form.skill_summary} onChange={e => set('skill_summary', e.target.value)} rows={4} className={inputClass} />
          </div>
        </div>
      </section>

      {/* 営業情報 */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">営業情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>上位営業先</label>
            <input type="text" value={form.top_sales_target} onChange={e => set('top_sales_target', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>面接担当者</label>
            <input type="text" value={form.interview_person} onChange={e => set('interview_person', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>営業担当者</label>
            <input type="text" value={form.sales_person} onChange={e => set('sales_person', e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {engineer ? '更新する' : '登録する'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-slate-600 hover:text-slate-800 font-medium px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
          キャンセル
        </button>
      </div>
    </form>
  )
}
