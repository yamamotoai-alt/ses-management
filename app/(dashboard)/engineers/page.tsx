import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EngineerList from '@/components/engineers/EngineerList'
import { ExportEngineersButton } from '@/components/ui/ExportCsvButton'
import { Plus, Search } from 'lucide-react'
import { Engineer } from '@/types'

interface Props {
  searchParams: { q?: string; status?: string; work_style?: string }
}

export default async function EngineersPage({ searchParams }: Props) {
  const supabase = createClient()

  let query = supabase.from('engineers').select('*').order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.work_style) query = query.eq('work_style', searchParams.work_style)
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const { data: engineers } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">エンジニア管理</h2>
          <p className="text-slate-500 text-sm mt-1">{engineers?.length ?? 0}名のエンジニア</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportEngineersButton engineers={(engineers ?? []) as Engineer[]} />
          <Link
            href="/engineers/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> 新規登録
          </Link>
        </div>
      </div>

      {/* 検索・フィルター */}
      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="氏名で検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          name="status"
          defaultValue={searchParams.status}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ステータス: 全て</option>
          <option value="稼働中">稼働中</option>
          <option value="待機中">待機中</option>
        </select>
        <select
          name="work_style"
          defaultValue={searchParams.work_style}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">稼働形態: 全て</option>
          <option value="フルリモート">フルリモート</option>
          <option value="ハイブリッド">ハイブリッド</option>
          <option value="常駐">常駐</option>
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          検索
        </button>
        <Link href="/engineers" className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 flex items-center">
          クリア
        </Link>
      </form>

      <EngineerList engineers={(engineers ?? []) as Engineer[]} />
    </div>
  )
}
