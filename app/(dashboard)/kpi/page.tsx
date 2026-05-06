export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users, Briefcase, Building2, TrendingUp, TrendingDown,
  UserCheck, Clock, DollarSign, GitBranch, Target, Activity,
  AlertTriangle, CheckCircle, BarChart2
} from 'lucide-react'

function pct(a: number, b: number) {
  if (!b) return '—'
  return Math.round((a / b) * 100) + '%'
}

function yen(n: number) {
  return '¥' + n.toLocaleString()
}

function daysFromNow(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function monthStart(monthsAgo: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function dayStart(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default async function KpiPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)
  const in60 = daysFromNow(60)
  const thisMonthStart = monthStart(0)
  const lastMonthStart = monthStart(1)
  const twoMonthsAgoStart = monthStart(2)
  const todayStart = dayStart(0)
  const yesterdayStart = dayStart(1)

  const [
    { count: totalEngineers },
    { count: activeEngineers },
    { count: waitingEngineers },
    { count: totalProjects },
    { count: activeProjects },
    { count: totalPartners },
    { data: allEngineers },
    { data: allProposals },
    { data: endingSoonRaw },
    { count: engineersThisMonth },
    { count: engineersLastMonth },
    { count: projectsThisMonth },
    { count: projectsLastMonth },
    { count: partnersThisMonth },
    { count: partnersLastMonth },
    { data: inflowData },
    { data: partnerTypeData },
    { count: engineersToday },
    { count: engineersYesterday },
    { count: projectsToday },
    { count: projectsYesterday },
    { count: partnersToday },
    { count: partnersYesterday },
  ] = await Promise.all([
    supabase.from('engineers').select('*', { count: 'exact', head: true }),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('status', '稼働中'),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('status', '待機中'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', '募集中'),
    supabase.from('partner_companies').select('*', { count: 'exact', head: true }),
    supabase.from('engineers').select('monthly_rate, status, inflow_source, created_at'),
    supabase.from('proposals').select('status, contract_end_date, engineers(id, name, monthly_rate), projects(id, name)'),
    supabase.from('proposals')
      .select('id, contract_end_date, engineers(id, name), projects(id, name)')
      .not('contract_end_date', 'is', null)
      .gte('contract_end_date', today)
      .lte('contract_end_date', in60)
      .order('contract_end_date'),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgoStart).lt('created_at', lastMonthStart),
    supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgoStart).lt('created_at', lastMonthStart),
    supabase.from('partner_companies').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    supabase.from('partner_companies').select('*', { count: 'exact', head: true }).gte('created_at', twoMonthsAgoStart).lt('created_at', lastMonthStart),
    supabase.from('engineers').select('inflow_source'),
    supabase.from('partner_companies').select('partner_type'),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', todayStart),
    supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('projects').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', todayStart),
    supabase.from('partner_companies').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('partner_companies').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', todayStart),
  ])

  const proposals = (allProposals ?? []) as any[]
  const engineers = (allEngineers ?? []) as any[]
  const endingSoon = (endingSoonRaw ?? []) as any[]

  // 稼働率
  const utilizationRate = totalEngineers ? Math.round(((activeEngineers ?? 0) / totalEngineers) * 100) : 0

  // 月次売上（稼働中エンジニアの単価合計）
  const monthlyRevenue = proposals
    .filter(p => p.status === '稼働開始')
    .reduce((sum: number, p: any) => sum + (p.engineers?.monthly_rate ?? 0), 0)

  // 待機損失（月額）
  const waitingLossMonthly = engineers
    .filter((e: any) => e.status === '待機中' && e.monthly_rate)
    .reduce((sum: number, e: any) => sum + e.monthly_rate, 0)

  // パイプライン各ステージ数
  const pipelineStats: Record<string, number> = {}
  const STAGES = ['提案準備', '提案中', '面談調整中', '面談済', '結果待ち', '受注', '稼働開始', '終了予定', '終了']
  STAGES.forEach(s => {
    pipelineStats[s] = proposals.filter((p: any) => p.status === s).length
  })

  // 提案→受注率
  const totalProposed = proposals.filter((p: any) =>
    ['提案中','面談調整中','面談済','結果待ち','受注','稼働開始','終了予定','終了'].includes(p.status)
  ).length
  const totalWon = proposals.filter((p: any) =>
    ['受注','稼働開始','終了予定'].includes(p.status)
  ).length
  const winRate = totalProposed ? Math.round((totalWon / totalProposed) * 100) : 0

  // 流入元別エンジニア数
  const inflowCounts: Record<string, number> = {}
  ;(inflowData ?? []).forEach((e: any) => {
    const src = e.inflow_source || '未設定'
    inflowCounts[src] = (inflowCounts[src] ?? 0) + 1
  })

  // 協業企業タイプ別
  const partnerTypeCounts: Record<string, number> = { '人員出し': 0, '案件出し': 0, '両方': 0, '未設定': 0 }
  ;(partnerTypeData ?? []).forEach((p: any) => {
    const t = p.partner_type || '未設定'
    partnerTypeCounts[t] = (partnerTypeCounts[t] ?? 0) + 1
  })

  // 月次増減デルタ表示
  function delta(current: number | null, prev: number | null) {
    const c = current ?? 0
    const p = prev ?? 0
    if (p === 0) return { label: `+${c}`, positive: true }
    const diff = c - p
    return { label: diff >= 0 ? `+${diff}` : `${diff}`, positive: diff >= 0 }
  }

  const engDelta = delta(engineersThisMonth, engineersLastMonth)
  const projDelta = delta(projectsThisMonth, projectsLastMonth)
  const partnerDelta = delta(partnersThisMonth, partnersLastMonth)
  // ※ thisMonth = 先月, lastMonth = 先々月（前月比は完全な月同士で比較）

  // 契約終了アラート分類
  const endingIn14 = endingSoon.filter((p: any) => {
    const days = Math.ceil((new Date(p.contract_end_date).getTime() - Date.now()) / 86400000)
    return days <= 14
  })
  const endingIn30 = endingSoon.filter((p: any) => {
    const days = Math.ceil((new Date(p.contract_end_date).getTime() - Date.now()) / 86400000)
    return days > 14 && days <= 30
  })
  const endingIn60 = endingSoon.filter((p: any) => {
    const days = Math.ceil((new Date(p.contract_end_date).getTime() - Date.now()) / 86400000)
    return days > 30
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">KPIダッシュボード</h2>
            <p className="text-slate-500 text-sm mt-0.5">SES事業の主要指標</p>
          </div>
        </div>
      </div>

      {/* ===== セクション1: 主要KPIカード ===== */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">主要指標</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'エンジニア総数', value: totalEngineers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/engineers', delta: engDelta, unit: '名' },
            { label: '稼働中', value: activeEngineers ?? 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', href: '/engineers?status=稼働中', unit: '名' },
            { label: '待機中', value: waitingEngineers ?? 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', href: '/engineers?status=待機中', unit: '名' },
            { label: '案件総数', value: totalProjects ?? 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', href: '/projects', delta: projDelta, unit: '件' },
            { label: '募集中案件', value: activeProjects ?? 0, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/projects?status=募集中', unit: '件' },
            { label: '協業企業数', value: totalPartners ?? 0, icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50', href: '/partners', delta: partnerDelta, unit: '社' },
          ].map(({ label, value, icon: Icon, color, bg, href, delta: d, unit }) => (
            <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
              {d && (
                <p className={`text-xs mt-1 font-medium ${d.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {d.label} 先月
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== セクション2: 売上・稼働率 ===== */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">売上 / 稼働状況</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 稼働率 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">稼働率</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{utilizationRate}<span className="text-lg text-slate-400">%</span></p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${utilizationRate}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">{activeEngineers ?? 0}名稼働 / {totalEngineers ?? 0}名中</p>
          </div>

          {/* 月次売上見込 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">月次売上見込</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{yen(monthlyRevenue)}</p>
            <p className="text-xs text-slate-500 mt-2">稼働開始中エンジニアの単価合計</p>
            <Link href="/billing" className="text-xs text-blue-600 hover:underline mt-1 block">請求管理 →</Link>
          </div>

          {/* 待機損失（月額） */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">待機損失（月額）</span>
              <TrendingDown className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-500">{yen(waitingLossMonthly)}</p>
            <p className="text-xs text-slate-500 mt-2">待機中 {waitingEngineers ?? 0}名の単価合計</p>
            <Link href="/engineers?status=待機中" className="text-xs text-blue-600 hover:underline mt-1 block">待機中一覧 →</Link>
          </div>

          {/* 提案受注率 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">提案受注率</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{winRate}<span className="text-lg text-slate-400">%</span></p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${winRate}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">受注{totalWon}件 / 提案{totalProposed}件</p>
          </div>
        </div>
      </section>

      {/* ===== セクション3: 追加実績（前日比 / 先月vs先々月） ===== */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">追加実績</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'エンジニア追加',
              today: engineersToday ?? 0,
              yesterday: engineersYesterday ?? 0,
              thisMonth: engineersThisMonth ?? 0,
              lastMonth: engineersLastMonth ?? 0,
              icon: Users,
              accent: 'blue',
              href: '/engineers',
              unit: '名',
            },
            {
              label: '案件追加',
              today: projectsToday ?? 0,
              yesterday: projectsYesterday ?? 0,
              thisMonth: projectsThisMonth ?? 0,
              lastMonth: projectsLastMonth ?? 0,
              icon: Briefcase,
              accent: 'purple',
              href: '/projects',
              unit: '件',
            },
            {
              label: '協業企業追加',
              today: partnersToday ?? 0,
              yesterday: partnersYesterday ?? 0,
              thisMonth: partnersThisMonth ?? 0,
              lastMonth: partnersLastMonth ?? 0,
              icon: Building2,
              accent: 'teal',
              href: '/partners',
              unit: '社',
            },
          ].map(({ label, today: td, yesterday: yd, thisMonth, lastMonth, icon: Icon, accent, href, unit }) => {
            const dayDiff = td - yd
            const monthDiff = thisMonth - lastMonth
            const dayUp = dayDiff >= 0
            const monthUp = monthDiff >= 0
            return (
              <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <Icon className={`w-4 h-4 text-${accent}-500`} />
                </div>

                {/* 前日比 */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 font-medium mb-2">前日比</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">本日</p>
                      <p className="text-2xl font-bold text-slate-800">{td}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">前日</p>
                      <p className="text-lg font-semibold text-slate-500">{yd}</p>
                    </div>
                  </div>
                  <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${dayUp ? 'text-green-600' : 'text-red-500'}`}>
                    {dayUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {dayDiff >= 0 ? '+' : ''}{dayDiff}{unit}
                  </div>
                </div>

                {/* 前月比 */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 font-medium mb-2">前月比</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">先月</p>
                      <p className="text-2xl font-bold text-slate-800">{thisMonth}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">先々月</p>
                      <p className="text-lg font-semibold text-slate-500">{lastMonth}</p>
                    </div>
                  </div>
                  <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${monthUp ? 'text-green-600' : 'text-red-500'}`}>
                    {monthUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {monthDiff >= 0 ? '+' : ''}{monthDiff}{unit}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ===== セクション4: パイプライン / 流入元 / 協業タイプ ===== */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">内訳分析</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* パイプライン分布 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700">提案パイプライン</h4>
              <Link href="/pipeline" className="text-xs text-blue-600 hover:underline">詳細 →</Link>
            </div>
            <div className="space-y-2">
              {[
                { stage: '提案準備', color: 'bg-slate-400' },
                { stage: '提案中', color: 'bg-blue-400' },
                { stage: '面談調整中', color: 'bg-indigo-400' },
                { stage: '面談済', color: 'bg-violet-400' },
                { stage: '結果待ち', color: 'bg-yellow-400' },
                { stage: '受注', color: 'bg-green-400' },
                { stage: '稼働開始', color: 'bg-emerald-500' },
                { stage: '終了予定', color: 'bg-orange-400' },
              ].map(({ stage, color }) => {
                const count = pipelineStats[stage] ?? 0
                const total = proposals.length || 1
                const width = Math.round((count / total) * 100)
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">{stage}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 流入元別エンジニア数 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700">流入元別エンジニア</h4>
              <Link href="/engineers" className="text-xs text-blue-600 hover:underline">詳細 →</Link>
            </div>
            <div className="space-y-3">
              {[
                { key: 'クラウドワークス', color: 'bg-blue-500' },
                { key: '複業クラウド', color: 'bg-purple-500' },
                { key: 'indeed', color: 'bg-green-500' },
                { key: 'その他', color: 'bg-orange-400' },
                { key: '未設定', color: 'bg-slate-300' },
              ].map(({ key, color }) => {
                const count = inflowCounts[key] ?? 0
                const total = (totalEngineers ?? 1)
                const width = Math.round((count / total) * 100)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{key}</span>
                      <span className="font-semibold text-slate-800">{count}名 <span className="text-slate-400">({pct(count, total)})</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 協業企業タイプ別 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700">協業企業タイプ</h4>
              <Link href="/partners" className="text-xs text-blue-600 hover:underline">詳細 →</Link>
            </div>
            <div className="space-y-3">
              {[
                { key: '人員出し', color: 'bg-purple-500', label: '人員出し（エンジニア紹介）' },
                { key: '案件出し', color: 'bg-emerald-500', label: '案件出し（案件紹介）' },
                { key: '両方', color: 'bg-blue-500', label: '両方' },
                { key: '未設定', color: 'bg-slate-300', label: '未設定' },
              ].map(({ key, color, label }) => {
                const count = partnerTypeCounts[key] ?? 0
                const total = totalPartners ?? 1
                const width = Math.round((count / total) * 100)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-800">{count}社 <span className="text-slate-400">({pct(count, total)})</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              {[
                { key: '人員出し', color: 'text-purple-600', bg: 'bg-purple-50' },
                { key: '案件出し', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { key: '両方', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(({ key, color, bg }) => (
                <div key={key} className={`${bg} rounded-lg p-2`}>
                  <p className={`text-lg font-bold ${color}`}>{partnerTypeCounts[key] ?? 0}</p>
                  <p className="text-xs text-slate-500">{key}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== セクション5: 契約終了アラート ===== */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">契約終了アラート（60日以内）</h3>
        {endingSoon.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">60日以内に終了予定の契約はありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-100">
              {[
                { label: '14日以内', count: endingIn14.length, color: 'text-red-600', bg: 'bg-red-50' },
                { label: '30日以内', count: endingIn30.length, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: '60日以内', count: endingIn60.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold ${color}`}>{count}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-100">
              {[...endingIn14, ...endingIn30, ...endingIn60].map((p: any) => {
                const days = Math.ceil((new Date(p.contract_end_date).getTime() - Date.now()) / 86400000)
                const urgency = days <= 14 ? { bg: 'bg-red-50', badge: 'bg-red-500', text: 'text-red-600' }
                  : days <= 30 ? { bg: 'bg-orange-50', badge: 'bg-orange-500', text: 'text-orange-600' }
                  : { bg: 'bg-yellow-50', badge: 'bg-yellow-500', text: 'text-yellow-700' }
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-5 py-3 ${urgency.bg}`}>
                    <AlertTriangle className={`w-4 h-4 ${urgency.text} flex-shrink-0`} />
                    <Link href={`/engineers/${p.engineers?.id}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 flex-shrink-0">
                      {p.engineers?.name}
                    </Link>
                    <span className="text-sm text-slate-500 flex-1 truncate">{p.projects?.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${urgency.badge} flex-shrink-0`}>残{days}日</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ===== セクション6: アクティブパイプラインサマリー ===== */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">アクティブ提案サマリー</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '提案中', count: pipelineStats['提案中'] ?? 0, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
            { label: '面談調整〜面談済', count: (pipelineStats['面談調整中'] ?? 0) + (pipelineStats['面談済'] ?? 0), color: 'border-violet-200 bg-violet-50', text: 'text-violet-700' },
            { label: '結果待ち', count: pipelineStats['結果待ち'] ?? 0, color: 'border-yellow-200 bg-yellow-50', text: 'text-yellow-700' },
            { label: '稼働開始', count: pipelineStats['稼働開始'] ?? 0, color: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700' },
          ].map(({ label, count, color, text }) => (
            <Link key={label} href="/pipeline" className={`rounded-xl border-2 ${color} p-4 hover:shadow-md transition-shadow text-center`}>
              <p className={`text-3xl font-bold ${text}`}>{count}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
