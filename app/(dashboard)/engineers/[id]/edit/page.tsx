import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EngineerForm from '@/components/engineers/EngineerForm'
import { ChevronLeft } from 'lucide-react'
import { Engineer } from '@/types'

export default async function EditEngineerPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('engineers').select('*').eq('id', params.id).single()
  if (!data) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/engineers/${params.id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 詳細に戻る
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">エンジニア編集</h2>
      </div>
      <EngineerForm engineer={data as Engineer} />
    </div>
  )
}
