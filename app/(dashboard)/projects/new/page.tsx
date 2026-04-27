import ProjectForm from '@/components/projects/ProjectForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" /> 案件一覧に戻る
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">案件新規登録</h2>
      </div>
      <ProjectForm />
    </div>
  )
}
