'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Engineer, SkillWithYears, WorkStyle, MONTHS } from '@/types'
import { type Role } from '@/lib/role'
import { Upload, Loader2, FileText, Wand2 } from 'lucide-react'

interface Props {
  engineer?: Engineer
  role?: Role
}

function skillsToText(items: SkillWithYears[]): string {
  return items.map(i => i.name).join('\n')
}

function textToSkills(text: string): SkillWithYears[] {
  return text.split(/[\n,、・/／;；]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => ({ name: s, years: 1 }))
}

function SkillTextarea({
  items,
  onChange,
  label,
  placeholder,
}: {
  items: SkillWithYears[]
  onChange: (items: SkillWithYears[]) => void
  label: string
  placeholder: string
}) {
  const [text, setText] = useState(() => skillsToText(items))

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <p className="text-xs text-slate-400 mb-2">カンマ・改行・スラッシュ等で区切って入力</p>
      <textarea
        value={text}
        onChange={e => {
          setText(e.target.value)
          onChange(textToSkills(e.target.value))
        }}
        rows={4}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  )
}

export default function EngineerForm({ engineer, role = 'admin' }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [textLoading, setTextLoading] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [bulkSkillText, setBulkSkillText] = useState('')
  const [bulkClassifying, setBulkClassifying] = useState(false)

  const [form, setForm] = useState({
    name: engineer?.name ?? '',
    initials: engineer?.initials ?? '',
    title: engineer?.title ?? '',
    age: engineer?.age?.toString() ?? '',
    nearest_station: engineer?.nearest_station ?? '',
    monthly_rate: engineer?.monthly_rate ? (engineer.monthly_rate / 10000).toString() : '',
    client_rate: engineer?.client_rate ? (engineer.client_rate / 10000).toString() : '',
    work_style: (engineer?.work_style ?? '') as WorkStyle | '',
    available_from: engineer?.available_from ?? '',
    skill_summary: engineer?.skill_summary ?? '',
    status: engineer?.status ?? '待機中',
    email: engineer?.email ?? '',
    phone: engineer?.phone ?? '',
    nationality: engineer?.nationality ?? '',
    desired_project: engineer?.desired_project ?? '',
    inflow_source: engineer?.inflow_source ?? '',
    working_hours: engineer?.working_hours ?? '',
    personality: engineer?.personality ?? '',
    notes: engineer?.notes ?? '',
    employment_type: engineer?.employment_type ?? '',
    top_sales_target: engineer?.top_sales_target ?? '',
    interview_person: engineer?.interview_person ?? '',
    sales_person: engineer?.sales_person ?? '',
    username: engineer?.username ?? '',
  })
  const [languages, setLanguages] = useState<SkillWithYears[]>(engineer?.languages ?? [])
  const [frameworks, setFrameworks] = useState<SkillWithYears[]>(engineer?.frameworks ?? [])
  const [cloudEnvs, setCloudEnvs] = useState<SkillWithYears[]>(engineer?.cloud_environments ?? [])
  const [dbSkills, setDbSkills] = useState<SkillWithYears[]>(engineer?.db_skills ?? [])
  const [osEnvs, setOsEnvs] = useState<SkillWithYears[]>(engineer?.os_environments ?? [])
  const [tools, setTools] = useState<SkillWithYears[]>(engineer?.tools ?? [])
  const [otherSkills, setOtherSkills] = useState<SkillWithYears[]>(engineer?.other_skills ?? [])

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfLoading(true)
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const res = await fetch('/api/pdf-parse', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.engineer) {
        const eng = data.engineer
        if (eng.name) set('name', eng.name)
        if (eng.age) set('age', eng.age.toString())
        if (eng.nearest_station) set('nearest_station', eng.nearest_station)
        if (eng.monthly_rate) set('monthly_rate', (eng.monthly_rate >= 1000 ? eng.monthly_rate / 10000 : eng.monthly_rate).toString())
        if (eng.work_style) set('work_style', eng.work_style)
        if (eng.skill_summary) set('skill_summary', eng.skill_summary)
        if (eng.available_from) set('available_from', eng.available_from)
        if (eng.languages?.length) setLanguages(eng.languages)
        if (eng.frameworks?.length) setFrameworks(eng.frameworks)
        if (eng.cloud_environments?.length) setCloudEnvs(eng.cloud_environments)
      }
    } catch (e) {
      alert('PDFの解析に失敗しました: ' + String(e))
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.result) {
        const r = data.result
        if (r.name) set('name', r.name)
        if (r.age) set('age', r.age.toString())
        if (r.nearest_station) set('nearest_station', r.nearest_station)
        if (r.monthly_rate) set('monthly_rate', (r.monthly_rate >= 1000 ? r.monthly_rate / 10000 : r.monthly_rate).toString())
        if (r.work_style) set('work_style', r.work_style)
        if (r.skill_summary) set('skill_summary', r.skill_summary)
        if (r.available_from) set('available_from', r.available_from)
        if (r.languages?.length) setLanguages(r.languages)
        if (r.frameworks?.length) setFrameworks(r.frameworks)
        if (r.cloud_environments?.length) setCloudEnvs(r.cloud_environments)
        setPasteText('')
        setShowTextInput(false)
      }
    } catch (e) {
      alert('テキストの解析に失敗しました: ' + String(e))
    }
    setTextLoading(false)
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
      if (r.languages?.length) setLanguages(r.languages.map((n: string) => ({ name: n, years: 1 })))
      if (r.frameworks?.length) setFrameworks(r.frameworks.map((n: string) => ({ name: n, years: 1 })))
      if (r.cloud_environments?.length) setCloudEnvs(r.cloud_environments.map((n: string) => ({ name: n, years: 1 })))
      if (r.db_skills?.length) setDbSkills(r.db_skills.map((n: string) => ({ name: n, years: 1 })))
      if (r.os_environments?.length) setOsEnvs(r.os_environments.map((n: string) => ({ name: n, years: 1 })))
      if (r.tools?.length) setTools(r.tools.map((n: string) => ({ name: n, years: 1 })))
      if (r.other_skills?.length) setOtherSkills(r.other_skills.map((n: string) => ({ name: n, years: 1 })))
      setBulkSkillText('')
    } catch (e) {
      alert('スキル分類に失敗しました: ' + String(e))
    }
    setBulkClassifying(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      initials: form.initials || null,
      title: form.title || null,
      age: form.age ? Number(form.age) : null,
      nearest_station: form.nearest_station || null,
      monthly_rate: form.monthly_rate ? Math.round(Number(form.monthly_rate) * 10000) : null,
      client_rate: form.client_rate ? Math.round(Number(form.client_rate) * 10000) : null,
      work_style: form.work_style || null,
      available_from: form.available_from || null,
      skill_summary: form.skill_summary || null,
      status: form.status,
      email: form.email || null,
      phone: form.phone || null,
      nationality: form.nationality || null,
      desired_project: form.desired_project || null,
      inflow_source: form.inflow_source || null,
      working_hours: form.working_hours || null,
      personality: form.personality || null,
      notes: form.notes || null,
      employment_type: form.employment_type || null,
      top_sales_target: form.top_sales_target || null,
      interview_person: form.interview_person || null,
      sales_person: form.sales_person || null,
      username: form.username || null,
      languages,
      frameworks,
      cloud_environments: cloudEnvs,
      db_skills: dbSkills,
      os_environments: osEnvs,
      tools,
      other_skills: otherSkills,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>氏名 <span className="text-red-500">*</span></label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>イニシャル</label>
            <input type="text" value={form.initials} onChange={e => set('initials', e.target.value)} className={inputClass} placeholder="例: Y.T." maxLength={20} />
          </div>
          {role === 'admin' && (
            <div>
              <label className={labelClass}>ユーザーネーム</label>
              <input type="text" value={form.username} onChange={e => set('username', e.target.value)} className={inputClass} placeholder="例: yamada_taro" />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelClass}>タイトル</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="例: Javaバックエンド 10年 / フルスタックエンジニア" />
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
            <label className={labelClass}>単価（万円/月）</label>
            <input type="number" value={form.monthly_rate} onChange={e => set('monthly_rate', e.target.value)} className={inputClass} step={0.5} placeholder="例: 60" />
          </div>
          <div>
            <label className={labelClass}>企業出し単価（万円/月）</label>
            <input type="number" value={form.client_rate} onChange={e => set('client_rate', e.target.value)} className={inputClass} step={0.5} placeholder="例: 70" />
          </div>
          <div>
            <label className={labelClass}>ステータス</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
              <option value="待機中">待機中</option>
              <option value="稼働中">稼働中</option>
              <option value="別企業で稼働">別企業で稼働</option>
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
          <div>
            <label className={labelClass}>メールアドレス</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="例: taro@example.com" />
          </div>
          <div>
            <label className={labelClass}>電話番号</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="例: 090-1234-5678" />
          </div>
          <div>
            <label className={labelClass}>国籍</label>
            <input type="text" value={form.nationality} onChange={e => set('nationality', e.target.value)} className={inputClass} placeholder="例: 日本、中国、ベトナム" />
          </div>
          <div>
            <label className={labelClass}>流入</label>
            <select value={form.inflow_source} onChange={e => set('inflow_source', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              <option value="クラウドワークス">クラウドワークス</option>
              <option value="複業クラウド">複業クラウド</option>
              <option value="indeed">indeed</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>稼働時間</label>
            <input type="text" value={form.working_hours} onChange={e => set('working_hours', e.target.value)} className={inputClass} placeholder="例: 週40時間、週20時間" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>希望案件</label>
            <input type="text" value={form.desired_project} onChange={e => set('desired_project', e.target.value)} className={inputClass} placeholder="例: Webアプリ開発、フルリモート希望" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>備考</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={inputClass} placeholder="その他備考事項" />
          </div>
        </div>
      </section>

      {/* スキル */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">スキル情報</h3>
        <div className="space-y-6">
          {/* スキル一括入力 */}
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <p className="text-sm font-medium text-violet-800 mb-1 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />AIスキル自動分類
            </p>
            <p className="text-xs text-violet-600 mb-2">スキルをまとめて貼り付けるとAIが自動でカテゴリに振り分けます</p>
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
              className="mt-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {bulkClassifying ? <><Loader2 className="w-4 h-4 animate-spin" />分類中...</> : <><Wand2 className="w-4 h-4" />自動分類する</>}
            </button>
          </div>
          <SkillTextarea items={languages} onChange={setLanguages} label="言語" placeholder={"Java, Python, TypeScript"} />
          <SkillTextarea items={frameworks} onChange={setFrameworks} label="フレームワーク" placeholder={"Spring Boot, React"} />
          <SkillTextarea items={cloudEnvs} onChange={setCloudEnvs} label="クラウド環境" placeholder={"AWS, GCP"} />
          <SkillTextarea items={dbSkills} onChange={setDbSkills} label="DB" placeholder={"MySQL, PostgreSQL, Oracle"} />
          <SkillTextarea items={osEnvs} onChange={setOsEnvs} label="OS" placeholder={"Linux, Windows, macOS"} />
          <SkillTextarea items={tools} onChange={setTools} label="ツール環境" placeholder={"Docker, Jenkins, GitHub"} />
          <SkillTextarea items={otherSkills} onChange={setOtherSkills} label="その他" placeholder={"Agile, Scrum"} />
          <div>
            <label className={labelClass}>エンジニア概要</label>
            <textarea value={form.skill_summary} onChange={e => set('skill_summary', e.target.value)} rows={4} className={inputClass} />
          </div>
        </div>
      </section>

      {/* 営業情報 */}
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">営業情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>所属ステータス</label>
            <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className={inputClass}>
              <option value="">未設定</option>
              <option value="弊社業務委託社員">弊社業務委託社員</option>
              <option value="弊社正社員">弊社正社員</option>
              <option value="一社先社員">一社先社員</option>
            </select>
          </div>
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
