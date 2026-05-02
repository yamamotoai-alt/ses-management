'use client'

import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { WorkStyle, MONTHS } from '@/types'

export default function PartnerProjectProposalForm({ engineerId }: { engineerId?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    name: '',
    budget_min: '',
    budget_max: '',
    duration: '',
    work_style: '' as WorkStyle | '',
    work_location: '',
    work_hours: '',
    interview_count: '',
    required_experience_years: '',
    required_requirements: '',
    preferred_requirements: '',
    description: '',
    project_content: '',
    project_notes: '',
  })

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"
  const req = <span className="text-red-500">*</span>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/partner-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, engineer_id: engineerId }),
      })
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
        <h2 className="text-xl font-bold text-slate-800 mb-2">案件提案を受け付けました！</h2>
        <p className="text-slate-500 text-sm">
          内容を確認の上、担当者よりご連絡いたします。<br />
          しばらくお待ちください。
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          続けて提案する
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 会社・担当者情報 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">ご担当者情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>会社名 {req}</label>
            <input type="text" required value={form.company_name} onChange={e => set('company_name', e.target.value)} className={inputClass} placeholder="株式会社〇〇" />
          </div>
          <div>
            <label className={labelClass}>ご担当者名 {req}</label>
            <input type="text" required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className={inputClass} placeholder="山田 太郎" />
          </div>
          <div>
            <label className={labelClass}>メールアドレス {req}</label>
            <input type="email" required value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className={inputClass} placeholder="taro@example.com" />
          </div>
        </div>
      </section>

      {/* 案件基本情報 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">案件情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>案件名 {req}</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="例: ECサイトリニューアル開発" />
          </div>
          <div>
            <label className={labelClass}>予算下限（万円/月）</label>
            <input type="number" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} className={inputClass} step={0.5} placeholder="例: 60" />
          </div>
          <div>
            <label className={labelClass}>予算上限（万円/月）</label>
            <input type="number" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} className={inputClass} step={0.5} placeholder="例: 80" />
          </div>
          <div>
            <label className={labelClass}>期間</label>
            <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} className={inputClass} placeholder="例: 3ヶ月〜長期" />
          </div>
          <div>
            <label className={labelClass}>稼働形態</label>
            <select value={form.work_style} onChange={e => set('work_style', e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              <option value="フルリモート">フルリモート</option>
              <option value="ハイブリッド">ハイブリッド（一部出社）</option>
              <option value="常駐">常駐（フル出社）</option>
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
            <label className={labelClass}>必要経験年数（年以上）</label>
            <input type="number" value={form.required_experience_years} onChange={e => set('required_experience_years', e.target.value)} className={inputClass} min={0} max={30} placeholder="例: 3" />
          </div>
        </div>
      </section>

      {/* 案件詳細 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 pb-2 border-b border-slate-100">案件詳細</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>必須要件 {req}</label>
            <textarea required value={form.required_requirements} onChange={e => set('required_requirements', e.target.value)} rows={4} className={inputClass} placeholder="例: Java 3年以上、Spring Boot経験、RDB設計経験" />
          </div>
          <div>
            <label className={labelClass}>歓迎要件</label>
            <textarea value={form.preferred_requirements} onChange={e => set('preferred_requirements', e.target.value)} rows={3} className={inputClass} placeholder="例: AWS経験、チームリード経験、英語対応可" />
          </div>
          <div>
            <label className={labelClass}>案件概要 {req}</label>
            <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputClass} placeholder="案件の概要・背景を入力してください" />
          </div>
          <div>
            <label className={labelClass}>案件内容</label>
            <textarea value={form.project_content} onChange={e => set('project_content', e.target.value)} rows={5} className={inputClass} placeholder="具体的な作業内容・業務詳細を入力してください" />
          </div>
          <div>
            <label className={labelClass}>備考</label>
            <textarea value={form.project_notes} onChange={e => set('project_notes', e.target.value)} rows={3} className={inputClass} placeholder="その他ご連絡事項があればご記入ください" />
          </div>
        </div>
      </section>

      <div className="pb-8">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? '送信中...' : '案件を提案する'}
        </button>
        <p className="text-xs text-slate-400 text-center mt-3">
          送信いただいた内容は担当者が確認し、ご連絡いたします。
        </p>
      </div>
    </form>
  )
}
