export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import BillingClient from '@/components/billing/BillingClient'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function BillingPage({ params }: { params: Promise<{ yearmonth: string }> }) {
  const { yearmonth } = await params
  const supabase = await createClient()

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, engineers(id, name, monthly_rate), projects(id, name, budget_min, budget_max)')
    .eq('status', '稼働開始')

  const { data: billings } = await supabase
    .from('monthly_billings')
    .select('*')
    .eq('year_month', yearmonth)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/billing" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 請求管理
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">{yearmonth} 月次稼働報告・請求</h2>
      </div>
      <BillingClient yearMonth={yearmonth} proposals={proposals ?? []} initialBillings={billings ?? []} />
    </div>
  )
}
