import EngineerForm from '@/components/engineers/EngineerForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewEngineerPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/engineers" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> エンジニア一覧に戻る
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">エンジニア新規登録</h2>
      </div>
      <EngineerForm />
    </div>
  )
}
