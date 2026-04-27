'use client'

import { useState } from 'react'
import { FileText, Loader2, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Proposal {
  id: string
  engineers: { id: string; name: string; monthly_rate: number | null } | null
  projects: { id: string; name: string; budget_min: number | null; budget_max: number | null } | null
}

interface Billing {
  id: string
  proposal_id: string
  year_month: string
  worked_hours: number | null
  lower_hours: number
  upper_hours: number
  over_unit_price: number | null
  under_unit_price: number | null
  billed_amount: number | null
  paid_amount: number | null
  status: string
}

interface Props {
  yearMonth: string
  proposals: Proposal[]
  initialBillings: Billing[]
}

function calcBilledAmount(
  workedHours: number,
  lowerHours: number,
  upperHours: number,
  monthlyRate: number,
  overUnitPrice: number | null,
  underUnitPrice: number | null,
): number {
  if (workedHours >= lowerHours && workedHours <= upperHours) return monthlyRate
  const unitPrice = monthlyRate / ((lowerHours + upperHours) / 2)
  const over = overUnitPrice ?? Math.round(unitPrice)
  const under = underUnitPrice ?? Math.round(unitPrice)
  if (workedHours > upperHours) return monthlyRate + Math.round((workedHours - upperHours) * over)
  return monthlyRate - Math.round((lowerHours - workedHours) * under)
}

export default function BillingClient({ yearMonth, proposals, initialBillings }: Props) {
  const supabase = createClient()
  const [billings, setBillings] = useState<Record<string, Partial<Billing>>>(() => {
    const m: Record<string, Partial<Billing>> = {}
    for (const b of initialBillings) m[b.proposal_id] = b
    return m
  })
  const [saving, setSaving] = useState<string | null>(null)

  function getBilling(proposalId: string): Partial<Billing> {
    return billings[proposalId] ?? {
      proposal_id: proposalId,
      year_month: yearMonth,
      lower_hours: 140,
      upper_hours: 180,
      worked_hours: null,
      over_unit_price: null,
      under_unit_price: null,
      billed_amount: null,
      paid_amount: null,
    }
  }

  function updateBilling(proposalId: string, field: string, value: number | null) {
    setBillings(prev => ({
      ...prev,
      [proposalId]: { ...getBilling(proposalId), [field]: value },
    }))
  }

  async function saveBilling(proposalId: string, proposal: Proposal) {
    setSaving(proposalId)
    const b = getBilling(proposalId)
    const monthlyRate = proposal.engineers?.monthly_rate ?? 0
    const workedHours = b.worked_hours ?? 0
    const billed = monthlyRate > 0 && workedHours > 0
      ? calcBilledAmount(workedHours, b.lower_hours ?? 140, b.upper_hours ?? 180, monthlyRate, b.over_unit_price ?? null, b.under_unit_price ?? null)
      : null
    const billedWithCalc = { ...b, billed_amount: billed, proposal_id: proposalId, year_month: yearMonth }

    if (b.id) {
      await supabase.from('monthly_billings').update(billedWithCalc).eq('id', b.id)
    } else {
      const { data } = await supabase.from('monthly_billings').insert(billedWithCalc).select().single()
      if (data) setBillings(prev => ({ ...prev, [proposalId]: data }))
    }
    setBillings(prev => ({ ...prev, [proposalId]: { ...billedWithCalc } }))
    setSaving(null)
  }

  function generatePDF(proposal: Proposal, type: 'invoice' | 'payment') {
    const b = getBilling(proposal.id)
    const name = proposal.engineers?.name ?? '—'
    const project = proposal.projects?.name ?? '—'
    const billed = b.billed_amount ?? proposal.engineers?.monthly_rate ?? 0
    const paid = b.paid_amount ?? billed

    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"/>
<style>body{font-family:"Hiragino Kaku Gothic ProN",sans-serif;padding:32px;color:#1E293B;}h1{font-size:22px;font-weight:700;border-bottom:2px solid #2563EB;padding-bottom:8px;margin-bottom:24px;}table{width:100%;border-collapse:collapse;margin-top:16px;}td,th{padding:8px 12px;border:1px solid #E2E8F0;font-size:13px;}th{background:#F8FAFC;font-weight:600;}</style>
</head><body>
<h1>${type === 'invoice' ? '請求書' : '支払通知書'}</h1>
<table>
  <tr><th>発行日</th><td>${new Date().toLocaleDateString('ja-JP')}</td></tr>
  <tr><th>対象月</th><td>${yearMonth}</td></tr>
  <tr><th>エンジニア</th><td>${name}</td></tr>
  <tr><th>案件</th><td>${project}</td></tr>
  <tr><th>稼働時間</th><td>${b.worked_hours ?? '—'}h（精算幅: ${b.lower_hours ?? 140}h〜${b.upper_hours ?? 180}h）</td></tr>
  <tr><th>${type === 'invoice' ? '請求金額' : '支払金額'}</th><td style="font-weight:700;font-size:16px;">¥${(type === 'invoice' ? billed : paid).toLocaleString()}</td></tr>
</table>
</body></html>`

    const win = window.open('', '_blank')
    if (!win) { alert('ポップアップを許可してください'); return }
    win.document.write(html)
    win.document.close()
    win.onload = () => { win.focus(); win.print() }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">エンジニア</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">案件</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">稼働h</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">精算下限</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">精算上限</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600">請求額</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600">支払額</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proposals.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">稼働中のエンジニアがいません</td></tr>
            )}
            {proposals.map(p => {
              const b = getBilling(p.id)
              const rate = p.engineers?.monthly_rate ?? 0
              const previewBilled = b.worked_hours && rate > 0
                ? calcBilledAmount(b.worked_hours, b.lower_hours ?? 140, b.upper_hours ?? 180, rate, b.over_unit_price ?? null, b.under_unit_price ?? null)
                : b.billed_amount

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.engineers?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.projects?.name ?? '—'}</td>
                  <td className="px-3 py-3">
                    <input type="number" value={b.worked_hours ?? ''} onChange={e => updateBilling(p.id, 'worked_hours', e.target.value ? Number(e.target.value) : null)}
                      className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="時間" />
                  </td>
                  <td className="px-3 py-3">
                    <input type="number" value={b.lower_hours ?? 140} onChange={e => updateBilling(p.id, 'lower_hours', Number(e.target.value))}
                      className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </td>
                  <td className="px-3 py-3">
                    <input type="number" value={b.upper_hours ?? 180} onChange={e => updateBilling(p.id, 'upper_hours', Number(e.target.value))}
                      className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-800">
                    {previewBilled ? `¥${previewBilled.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <input type="number" value={b.paid_amount ?? ''} onChange={e => updateBilling(p.id, 'paid_amount', e.target.value ? Number(e.target.value) : null)}
                      className="w-24 border border-slate-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="支払額" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => saveBilling(p.id, p)} disabled={saving === p.id}
                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded transition-colors">
                        {saving === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '保存'}
                      </button>
                      <button onClick={() => generatePDF(p, 'invoice')} title="請求書"
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1">
                        <FileText className="w-3 h-3" />請求
                      </button>
                      <button onClick={() => generatePDF(p, 'payment')} title="支払通知書"
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1">
                        <FileText className="w-3 h-3" />支払
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {proposals.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => proposals.forEach(p => generatePDF(p, 'invoice'))}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />全件一括PDF印刷
          </button>
        </div>
      )}
    </div>
  )
}
