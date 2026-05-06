'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, FileText, GitBranch, Trash2 } from 'lucide-react'
import { Engineer, Proposal } from '@/types'
import { Role } from '@/lib/role'
import { createClient } from '@/lib/supabase/client'
import SummaryModal from '@/components/engineers/SummaryModal'
import AddProposalModal from '@/components/pipeline/AddProposalModal'
import SendEngineerEmailModal from '@/components/email/SendEngineerEmailModal'
import SendMatchedProjectsEmailButton from '@/components/email/SendMatchedProjectsEmailButton'

interface Props {
  engineer: Engineer
  role: Role
}

export default function EngineerDetailActions({ engineer, role }: Props) {
  const router = useRouter()
  const [showSummary, setShowSummary] = useState(false)
  const [showAddProposal, setShowAddProposal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${engineer.name}」を削除しますか？この操作は取り消せません。`)) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('engineers').delete().eq('id', engineer.id)
    if (error) {
      alert('削除に失敗しました: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/engineers')
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <button
          onClick={() => setShowSummary(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">サマリー出力</span>
        </button>
        <button
          onClick={() => setShowAddProposal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          <span className="hidden sm:inline">案件に提案</span>
        </button>
        {role === 'admin' && <SendMatchedProjectsEmailButton engineer={engineer} />}
        {role === 'admin' && <SendEngineerEmailModal engineer={engineer} />}
        {role === 'admin' && (
          <>
            <Link
              href={`/engineers/${engineer.id}/edit`}
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
          </>
        )}
      </div>

      {showSummary && (
        <SummaryModal engineer={engineer} onClose={() => setShowSummary(false)} />
      )}
      {showAddProposal && (
        <AddProposalModal
          onClose={() => setShowAddProposal(false)}
          onAdded={(_proposal: Proposal) => setShowAddProposal(false)}
          defaultEngineerId={engineer.id}
        />
      )}
    </>
  )
}
