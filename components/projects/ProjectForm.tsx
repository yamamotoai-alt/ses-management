'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, SkillWithYears, LANGUAGE_OPTIONS, FRAMEWORK_OPTIONS, CLOUD_OPTIONS } from '@/types'
import { Plus, X, Loader2, FileText } from 'lucide-react'

interface Props { project?: Project }

function SkillInput({ items, onChange, options, label }: {
  items: SkillWithYears[]
  onChange: (items: SkillWithYears[]) => void
  options: string[]
  label: string
}) {
  const add = () => onChange([...items, { name: '', years: 1 }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof SkillWithYears, val: string | number) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              value={options.includes(item.name) ? item.name : 'その他'}
              onChange={e => update(i, 'name', e.target.value === 'その他' ? 'その他' : e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {item.name === 'その他' && (
              <input
                type="text"
                value={item.name === 'その他' ? '' : item.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="具体的に入力"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="number"
              value={item.years}
              onChange={e => update(i, 'years', Number(e.target.value))}
              min={0} max={30}
              className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center text-sm text-slate-500 whitespace-nowrap">年以上</span>
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-4 h-4" /> {label}を追加
        </button>
      </div>
    </div>
  )
}

function OptionalSkillInput({ items, onChange, options, label }: {
  items: SkillWithYears[]
  onChange: (items: SkillWithYears[]) => void
  options: string[]
  label: string
}) {
  const add = () => onChange([...items, { name: '', years: 1 }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof SkillWithYears, val: string | number) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              value={options.includes(item.name) ? item.name : 'その他'}
              onChange={e => update(i, 'name', e.target.value === 'その他' ? 'その他' : e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {item.name === 'その他' && (
              <input
                type="text"
                value={item.name === 'その他' ? '' : item.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="具体的に入力"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="number"
              value={item.years}
              onChange={e => update(i, 'years', Number(e.target.value))}
              min={0} max={30}
              className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center text-sm text-slate-500 whitespace-nowrap">年以上</span>
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-4 h-4" /> {label}を追加
        </button>
      </div>
    </div>
  )
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [textLoading, setTextLoading] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)

  const [form, setForm] = useState({
    name: project?.name ?? '',
    introducer: project?.introducer ?? '',
    budget_min: project?.budget_min?.toString() ?? '',
    budget_max: project?.budget_max?.toString() ?? '',
    duration: project?.duration ?? '',
    work_style: project?.work_style ?? '',
    work_location: project?.work_location ?? '',
    work_hours: project?.work_hours ?? '',
    interview_count: project?.interview_count ?? '',
    commercial_flow: project?.commercial_flow ?? '',
    required_experience_years: project?.required_experience_years?.toString() ?? '',
    description: project?.description ?? '',
    project_content: project?.project_content ?? '',
    project_notes: project?.project_notes ?? '',
    status: project?.status ?? '募集中',
  })

  const [reqLangs, setReqLangs] = useState<SkillWithYears[]>(project?.required_languages ?? [])
  const [reqFrameworks, setReqFrameworks] = useState<SkillWithYears[]>(project?.required_frameworks ?? [])
  const [reqCloud, setReqCloud] = useState<SkillWithYears[]>(project?.required_cloud ?? [])
  const [optLangs, setOptLangs] = useState<SkillWithYears[]>(project?.optional_languages ?? [])
  const [optFrameworks, setOptFrameworks] = useState<SkillWithYears[]>(project?.optional_frameworks ?? [])
  const [optCloud, setOptCloud] = useState<SkillWithYears[]>(project?.optional_cloud ?? [])

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleTextParse() {
    if (!pasteText.trim()) return
    setTextLoading(true)
    try {
      const res = await fetch('/api/text-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText, type: 'project' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.result) {
        const r = data.result
        if (r.name) set('name', r.name)
        if (r.budget_min) set('budget_min', r.budget_min.toString())
        if (r.budget_max) set('budget_max', r.budget_max.toString())
        if (r.duration) set('duration', r.duration)
        if (r.work_style) set('work_style', r.work_style)
        if (r.work_location) set('work_location', r.work_location)
        if (r.work_hours) set('work_hours', r.work_hours)
        if (r.interview_count) set('interview_count', r.interview_count)
        if (r.commercial_flow) set('commercial_flow', r.commercial_flow)
        if (r.required_experience_years) set('required_experience_years', r.required_experience_years.toString())
        if (r.description) set('description', r.description)
        if (r.project_content) set('project_content', r.project_content)
        if (r.project_notes) set('project_notes', r.project_notes)
        if (r.required_languages?.length) setReqLangs(r.required_languages)
        if (r.required_frameworks?.length) setReqFrameworks(r.required_frameworks)
        if (r.required_cloud?.length) setReqCloud(r.required_cloud)
        if (r.optional_languages?.length) setOptLangs(r.optional_languages)
        if (r.optional_frameworks?.length) setOptFrameworks(r.optional_frameworks)
        if (r.optional_cloud?.length) setOptCloud(r.optional_cloud)
        setPasteText('')
        setShowTextInput(false)
      }
    } catch (e) {
      alert('テキストの解析に失敗しました: ' + String(e))
    }
    setTextLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      introducer: form.introducer || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      duration: form.duration || null,
      work_style: form.work_style || null,
      work_location: form.work_location || null,
      work_hours: form.work_hours || null,
      interview_count: form.interview_count || null,
      commercial_flow: form.commercial_flow || null,
      required_experience_years: form.required_experience_years ? Number(form.required_experience_years) : null,
      description: form.description || null,
      project_content: form.project_content || null,
      project_notes: form.project_notes || null,
      status: form.status,
      required_languages: reqLangs,
      required_frameworks: reqFrameworks,
      required_cloud: reqCloud,
      optional_languages: optLangs,
      optional_frameworks: optFrameworks,
      optional_cloud: optCloud,
    }

    let error
    if (project) {
      ;({ error } = await supabase.from('projects').update(payload).eq('id', project.id))
    } else {
      ;({ error } = await supabase.from('projects').insert(payload))
    }

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      router.push('/projects')
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
        <button
          type="button"
          onClick={() => setShowTextInput(v => !v)}
          disabled={textLoading}
          className="bg-white border border-blue-300 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />テキストから入力
        </button>
        {showTextInput && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-blue-600">案件情報のテキストを貼り付けてください（メール文面・Slack共有文等）</p>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={6}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="例：&#10;【案件名】ECサイトリニューアル&#10;【単価】60〜70万円/月&#10;【期間】6ヶ月〜&#10;【必須スキル】Java 3年以上、Spring Boot&#10;【勤務形態】フルリモート&#10;【概要】大手ECサイトのバックエンド開発..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>案件名 <span className="text-red-500">*</span></label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>紹介者名</label>
            <input type="text" value={form.introducer} onChange={e => set('introducer', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>ステータス</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
              <option value="募集中">募集中</option>
              <option value="終了">終了</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>予算下限（円/月）</label>
            <input type="number" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} className={inputClass} step={10000} />
          </div>
          <div>
            <label className={labelClass}>予算上限（円/月）</label>
            <input type="number" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} className={inputClass} step={10000} />
          </div>
          <div>
            <label className={labelClass}>期間</label>
            <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} className={inputClass} placeholder="例: 3ヶ月〜" />
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
            <label className={labelClass}>勤務場所</label>
            <input type="text" value={form.work_location} onChange={e => set('work_location', e.target.value)} className={inputClass} placeholder="例: 渋谷、フルリモート" />
          </div>
          <div>
            <label className={labelClass}>勤務時間</label>
            <input type="text" value={form.work_hours} onChange={e => set('work_hours', e.target.value)} className={inputClass} placeholder="例: 9:00〜18:00" />
          </div>
          <div>
            <label className={labelClass}>面談回数</label>
            <input type="text" value={form.interview_count} onChange={e => set('interview_count', e.target.value)} className={inputClass} placeholder="例: 1回" />
          </div>
          <div>
            <label className={labelClass}>商流</label>
            <input type="text" value={form.commercial_flow} onChange={e => set('commercial_flow', e.target.value)} className={inputClass} placeholder="例: エンド直、1次受け" />
          </div>
          <div>
            <label className={labelClass}>必要経験年数（年以上）</label>
            <input type="number" value={form.required_experience_years} onChange={e => set('required_experience_years', e.target.value)} className={inputClass} min={0} max={30} />
          </div>
        </div>
      </section>

      {/* 必須スキル */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">必須スキル</h3>
        <div className="space-y-6">
          <SkillInput items={reqLangs} onChange={setReqLangs} options={LANGUAGE_OPTIONS} label="必須言語" />
          <SkillInput items={reqFrameworks} onChange={setReqFrameworks} options={FRAMEWORK_OPTIONS} label="必須フレームワーク" />
          <SkillInput items={reqCloud} onChange={setReqCloud} options={CLOUD_OPTIONS} label="クラウド環境" />
        </div>
      </section>

      {/* 尚可スキル */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">尚可スキル</h3>
        <div className="space-y-6">
          <OptionalSkillInput items={optLangs} onChange={setOptLangs} options={LANGUAGE_OPTIONS} label="尚可言語" />
          <OptionalSkillInput items={optFrameworks} onChange={setOptFrameworks} options={FRAMEWORK_OPTIONS} label="尚可フレームワーク" />
          <OptionalSkillInput items={optCloud} onChange={setOptCloud} options={CLOUD_OPTIONS} label="尚可クラウド環境" />
        </div>
      </section>

      {/* 案件詳細 */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">案件詳細</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>案件概要</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputClass} placeholder="案件の概要を入力してください" />
          </div>
          <div>
            <label className={labelClass}>案件内容</label>
            <textarea value={form.project_content} onChange={e => set('project_content', e.target.value)} rows={5} className={inputClass} placeholder="具体的な作業内容・業務詳細を入力してください" />
          </div>
          <div>
            <label className={labelClass}>案件備考</label>
            <textarea value={form.project_notes} onChange={e => set('project_notes', e.target.value)} rows={3} className={inputClass} placeholder="その他備考事項を入力してください" />
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
          {project ? '更新する' : '登録する'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-slate-600 font-medium px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
          キャンセル
        </button>
      </div>
    </form>
  )
}
