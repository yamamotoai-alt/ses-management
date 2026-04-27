'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Mail } from 'lucide-react'
import { ExportProjectsButton } from '@/components/ui/ExportCsvButton'
import BulkImportModal from './BulkImportModal'
import { Project } from '@/types'

interface Props {
  projects: Project[]
  count: number
}

export default function ProjectListHeader({ projects, count }: Props) {
  const [showImport, setShowImport] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">案件管理</h2>
          <p className="text-slate-500 text-sm mt-1">{count}件の案件</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportProjectsButton projects={projects} />
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">メール取り込み</span>
          </button>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">新規登録</span>
          </Link>
        </div>
      </div>

      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onImported={() => window.location.reload()}
        />
      )}
    </>
  )
}
