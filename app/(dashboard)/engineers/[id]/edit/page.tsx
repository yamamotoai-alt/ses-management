export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import EngineerForm from '@/components/engineers/EngineerForm'
import { ChevronLeft } from 'lucide-react'
import { Engineer } from '@/types'
import { getRole } from '@/lib/role'

export default async function EditEngineerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = await getRole()
  if (role !== 'admin') redirect(`/engineers/${id}`)

  const supabase = await createClient()
  const { data } = await supabase.from('engineers').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href={`/engineers/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 詳細に戻る
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">エンジニア編集</h2>
      </div>
      <EngineerForm engineer={data as Engineer} role={role} />
    </div>
  )
}
