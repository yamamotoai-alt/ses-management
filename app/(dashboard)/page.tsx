export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRole } from '@/lib/role'
import Link from 'next/link'
import { Users, Briefcase, UserCheck, AlertCircle, Clock, TrendingUp, Sparkles, Calendar } from 'lucide-react'
import { Proposal } from '@/types'

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default async function DashboardPage() {
  const role = await getRole()
  if (role === 'sales') redirect('/engineers')

  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)
  const in14 = daysFromNow(14)
  const in30 = daysFromNow(30)
  const in60 = daysFromNow(60)
  const yesterday = new Date(Date.now() - 86400000).toISOString()

  const [
    { count: totalEngineers },
    { count: activeEngineers },
    { count: waitingEngineers },
    { count: totalProjects },
    { count: activeProjects },
    { count: newProjectsToday },
    { data: proposalsData },
    { data: endingSoonData },
  ] = await Promise.all([
    supabase.from('engineers').select('*', { count: 'exact', head: true }),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('status', '稼働中'),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('status', '待機中'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', '募集中'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
    supabase.from('proposals').select('status, next_action_at, contract_end_date, renewal_decision, engineers(id, name, monthly_rate), projects(id, name)'),
    supabase.from('proposals')
      .select('id, contract_end_date, renewal_decision, engineers(id, name), projects(id, name)')
      .not('contract_end_date', 'is', null)
      .gte('contract_end_date', today)
      .lte('contract_end_date', in60)
      .order('contract_end_date'),
  ])

  const proposals = (proposalsData ?? []) as any[]
  const endingSoon = (endingSoonData ?? []) as any[]

  const pipelineStats = Object.fromEntries(
    ['提案準備','提案中','面談調整中','面談済','結果待ち','受注','稼働開始','終了予定','終了'].map(
      s => [s, proposals.filter(p => p.status === s).length]
    )
  )

  const waitingLoss = proposals
    .filter(p => p.status !== '稼働開始' && p.engineers?.monthly_rate)
    .reduce((sum, p) => sum + Math.round((p.engineers!.monthly_rate! / 20)), 0)

  const endingIn14 = endingSoon.filter(p => daysUntil(p.contract_end_date!) <= 14)
  const endingIn30 = endingSoon.filter(p => daysUntil(p.contract_end_date!) > 14 && daysUntil(p.contract_end_date!) <= 30)
  const endingIn60 = endingSoon.filter(p => daysUntil(p.contract_end_date!) > 30)

  const stats = [
    { label: 'エンジニア総数', value: totalEngineers ?? 0, icon: Users, color: 'bg-blue-500', href: '/engineers' },
    { label: '稼働中', value: activeEngineers ?? 0, icon: UserCheck, color: 'bg-green-500', href: '/engineers?status=稼働中' },
    { label: '案件総数', value: totalProjects ?? 0, icon: Briefcase, color: 'bg-purple-500', href: '/projects' },
    { label: '募集中案件', value: activeProjects ?? 0, icon: AlertCircle, color: 'bg-orange-500', href: '/projects?status=募集中' },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">ダッシュボード</h2>
        <p className="text-slate-500 text-sm mt-1">SES事業の概況</p>
      </div>

      {/* 基本統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${color} p-2 rounded-lg`}><Icon className="w-5 h-5 text-white" /></div>
              <span className="text-sm text-slate-500 font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </Link>
        ))}
      </div>

      {/* 追加統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* 待機損失 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-slate-700">待機損失（日額見込）</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">¥{waitingLoss.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">待機中 {waitingEngineers ?? 0}名 × 単価/20日</p>
          <Link href="/engineers?status=待機中" className="text-xs text-blue-600 hover:underline mt-1 block">待機中一覧 →</Link>
        </div>

        {/* 新規取り込み */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">直近24h 新規案件</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{newProjectsToday ?? 0}件</p>
          <p className="text-xs text-slate-500 mt-1">取り込まれた案件数</p>
          <Link href="/projects" className="text-xs text-blue-600 hover:underline mt-1 block">案件一覧 →</Link>
        </div>

        {/* パイプライン分布 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-slate-700">提案ステージ分布</span>
          </div>
          <div className="space-y-1">
            {['提案中','面談調整中','結果待ち','受注','稼働開始'].map(s => (
              <div key={s} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{s}</span>
                <span className="font-semibold text-slate-800">{pipelineStats[s] ?? 0}件</span>
              </div>
            ))}
          </div>
          <Link href="/pipeline" className="text-xs text-blue-600 hover:underline mt-2 block">パイプライン →</Link>
        </div>
      </div>

      {/* 契約終了アラート */}
      {endingSoon.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-slate-800">契約終了アラート</h3>
          </div>
          <div className="space-y-2">
            {endingIn14.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">14日以内</span>
                <span className="text-sm font-medium text-slate-800">{p.engineers?.name}</span>
                <span className="text-sm text-slate-500">{p.projects?.name}</span>
                <span className="ml-auto text-sm font-semibold text-red-600">残{daysUntil(p.contract_end_date!)}日</span>
              </div>
            ))}
            {endingIn30.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">30日以内</span>
                <span className="text-sm font-medium text-slate-800">{p.engineers?.name}</span>
                <span className="text-sm text-slate-500">{p.projects?.name}</span>
                <span className="ml-auto text-sm font-semibold text-orange-600">残{daysUntil(p.contract_end_date!)}日</span>
              </div>
            ))}
            {endingIn60.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">60日以内</span>
                <span className="text-sm font-medium text-slate-800">{p.engineers?.name}</span>
                <span className="text-sm text-slate-500">{p.projects?.name}</span>
                <span className="ml-auto text-sm font-semibold text-yellow-600">残{daysUntil(p.contract_end_date!)}日</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <Link href="/engineers/new" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm text-blue-700 font-medium">
              <Users className="w-4 h-4" />エンジニアを新規登録
            </Link>
            <Link href="/projects/new" className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm text-purple-700 font-medium">
              <Briefcase className="w-4 h-4" />案件を新規登録
            </Link>
            <Link href="/pipeline" className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm text-green-700 font-medium">
              <TrendingUp className="w-4 h-4" />提案パイプラインを確認
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">AIマッチング</h3>
          <p className="text-sm text-slate-500 mb-4">エンジニア詳細・案件詳細ページから、AIによるマッチング提案を確認できます。</p>
          <div className="space-y-2">
            <Link href="/engineers" className="block text-sm text-blue-600 hover:underline">→ エンジニア一覧からマッチングを確認</Link>
            <Link href="/projects" className="block text-sm text-blue-600 hover:underline">→ 案件一覧からマッチングを確認</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
