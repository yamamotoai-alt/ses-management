'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, FileText, GitBranch } from 'lucide-react'
import { Engineer } from '@/types'
import SkillSheetModal from '@/components/skillsheet/SkillSheetModal'
import AddProposalModal from '@/components/pipeline/AddProposalModal'
import { Proposal } from '@/types'

interface Props {
  engineer: Engineer
}

export default function EngineerDetailActions({ engineer }: Props) {
  const [showSkillSheet, setShowSkillSheet] = useState(false)
  const [showAddProposal, setShowAddProposal] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <button
          onClick={() => setShowSkillSheet(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">スキルシート出力</span>
        </button>
        <button
          onClick={() => setShowAddProposal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          <span className="hidden sm:inline">案件に提案</span>
        </button>
        <Link
          href={`/engineers/${engineer.id}/edit`}
          className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">編集</span>
        </Link>
      </div>

      {showSkillSheet && (
        <SkillSheetModal engineer={engineer} onClose={() => setShowSkillSheet(false)} />
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
