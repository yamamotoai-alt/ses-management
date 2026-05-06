'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types'
import { Role } from '@/lib/role'
import SendProjectEmailModal from '@/components/email/SendProjectEmailModal'
import SendMatchedEngineersEmailButton from '@/components/email/SendMatchedEngineersEmailButton'

interface Props {
  project: Project
  role: Role
}

export default function ProjectDetailActions({ project, role }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${project.name}」を削除しますか？この操作は取り消せません。`)) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) {
      alert('削除に失敗しました: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/projects')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
      {role === 'admin' && <SendMatchedEngineersEmailButton project={project} />}
      {role === 'admin' && <SendProjectEmailModal project={project} />}
      <Link
        href={`/projects/${project.id}/edit`}
        className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">編集</span>
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-2 border border-red-300 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">{deleting ? '削除中...' : '削除'}</span>
      </button>
    </div>
  )
}
