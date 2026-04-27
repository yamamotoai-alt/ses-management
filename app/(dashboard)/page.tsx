import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Briefcase, UserCheck, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { count: totalEngineers },
    { count: activeEngineers },
    { count: totalProjects },
    { count: activeProjects },
  ] = await Promise.all([
    supabase.from('engineers').select('*', { count: 'exact', head: true }),
    supabase.from('engineers').select('*', { count: 'exact', head: true }).eq('status', '稼働中'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', '募集中'),
  ])

  const stats = [
    { label: 'エンジニア総数', value: totalEngineers ?? 0, icon: Users, color: 'bg-blue-500', href: '/engineers' },
    { label: '稼働中', value: activeEngineers ?? 0, icon: UserCheck, color: 'bg-green-500', href: '/engineers?status=稼働中' },
    { label: '案件総数', value: totalProjects ?? 0, icon: Briefcase, color: 'bg-purple-500', href: '/projects' },
    { label: '募集中案件', value: activeProjects ?? 0, icon: AlertCircle, color: 'bg-orange-500', href: '/projects?status=募集中' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">ダッシュボード</h2>
        <p className="text-slate-500 text-sm mt-1">SES事業の概況</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-500 font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">クイックアクション</h3>
          </div>
          <div className="space-y-3">
            <Link href="/engineers/new" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm text-blue-700 font-medium">
              <Users className="w-4 h-4" />
              エンジニアを新規登録
            </Link>
            <Link href="/projects/new" className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm text-purple-700 font-medium">
              <Briefcase className="w-4 h-4" />
              案件を新規登録
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">AIマッチング</h3>
          <p className="text-sm text-slate-500 mb-4">
            エンジニア詳細・案件詳細ページから、AIによるマッチング提案を確認できます。
          </p>
          <div className="space-y-2">
            <Link href="/engineers" className="block text-sm text-blue-600 hover:underline">→ エンジニア一覧からマッチングを確認</Link>
            <Link href="/projects" className="block text-sm text-blue-600 hover:underline">→ 案件一覧からマッチングを確認</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
