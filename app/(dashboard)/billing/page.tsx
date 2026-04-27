export const runtime = 'edge'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function BillingIndexPage() {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">請求管理</h2>
        <p className="text-slate-500 text-sm mt-1">月次稼働報告・請求書・支払通知書</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-md">
        {months.map(ym => (
          <Link
            key={ym}
            href={`/billing/${ym}`}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-800">{ym}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
