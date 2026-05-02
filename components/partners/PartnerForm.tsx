'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PartnerCompany } from '@/types'
import { Loader2 } from 'lucide-react'

interface Props { partner?: PartnerCompany }

const CONTACT_METHOD_OPTIONS = ['メール', 'Slack', 'Chatwork', 'LINE', '電話', 'その他']

export default function PartnerForm({ partner }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    company_name: partner?.company_name ?? '',
    contact_person: partner?.contact_person ?? '',
    email: partner?.email ?? '',
    phone: partner?.phone ?? '',
    contact_method: partner?.contact_method ?? '',
    partner_type: partner?.partner_type ?? '',
    notes: partner?.notes ?? '',
  })

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      company_name: form.company_name,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      contact_method: form.contact_method || null,
      partner_type: form.partner_type || null,
      notes: form.notes || null,
    }

    let error
    if (partner) {
      ;({ error } = await supabase.from('partner_companies').update(payload).eq('id', partner.id))
    } else {
      ;({ error } = await supabase.from('partner_companies').insert(payload))
    }

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      router.push('/partners')
      router.refresh()
    }
    setSaving(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <section>
        <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">企業情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>企業名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.company_name}
              onChange={e => set('company_name', e.target.value)}
              className={inputClass}
              placeholder="例: 株式会社サンプル"
            />
          </div>
          <div>
            <label className={labelClass}>担当者名</label>
            <input
              type="text"
              value={form.contact_person}
              onChange={e => set('contact_person', e.target.value)}
              className={inputClass}
              placeholder="例: 田中 一郎"
            />
          </div>
          <div>
            <label className={labelClass}>連絡手段</label>
            <select
              value={form.contact_method}
              onChange={e => set('contact_method', e.target.value)}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {CONTACT_METHOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>取引区分</label>
            <div className="flex gap-3 mt-1">
              {(['人員出し', '案件出し', '両方'] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="partner_type"
                    value={type}
                    checked={form.partner_type === type}
                    onChange={e => set('partner_type', e.target.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>メールアドレス</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={inputClass}
              placeholder="例: tanaka@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>電話番号</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className={inputClass}
              placeholder="例: 03-1234-5678"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>備考</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="取引条件・商流・その他メモなど"
            />
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
          {partner ? '更新する' : '登録する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-600 font-medium px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
