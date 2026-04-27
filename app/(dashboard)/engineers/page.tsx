export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EngineerList from '@/components/engineers/EngineerList'
import { ExportEngineersButton } from '@/components/ui/ExportCsvButton'
import { Plus, Search } from 'lucide-react'
import { Engineer } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; status?: string; work_style?: string }>
}

export default async function EngineersPage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase.from('engineers').select('*').order('created_at', { ascending: false })

  if (sp.status) query = query.eq('status', sp.status)
  if (sp.work_style) query = query.eq('work_style', sp.work_style)
  if (sp.q) query = query.ilike('name', `%${sp.q}%`)

  const { data: engineers } = await query

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">エンジニア管理</h2>
          <p className="text-slate-500 text-sm mt-1">{engineers?.length ?? 0}名のエンジニア</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportEngineersButton engineers={(engineers ?? []) as Engineer[]} />
          <Link
            href="/engineers/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">新規登録</span>
          </Link>
        </div>
      </div>

      {/* 検索・フィルター */}
      <form className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="氏名で検索..."
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ステータス: 全て</option>
          <option value="稼働中">稼働中</option>
          <option value="待機中">待機中</option>
        </select>
        <select
          name="work_style"
          defaultValue={sp.work_style}
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
