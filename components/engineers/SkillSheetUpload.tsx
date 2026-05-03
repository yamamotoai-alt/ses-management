'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Engineer } from '@/types'
import { Upload, Trash2, Download, FileText, Loader2 } from 'lucide-react'

interface Props {
  engineer: Engineer
}

type SheetType = 'real' | 'initials'
type ResumeType = 'resume_real'
type FileType = SheetType | ResumeType

const SHEETS: { type: SheetType; label: string; pathField: 'skill_sheet_real_path' | 'skill_sheet_initials_path'; description: string }[] = [
  { type: 'real', label: '本名版', pathField: 'skill_sheet_real_path', description: '氏名そのままのスキルシート' },
  { type: 'initials', label: 'イニシャル版', pathField: 'skill_sheet_initials_path', description: 'イニシャル表記のスキルシート' },
]

const RESUMES: { type: ResumeType; label: string; pathField: 'resume_real_path'; description: string }[] = [
  { type: 'resume_real', label: '本名版', pathField: 'resume_real_path', description: '氏名そのままの履歴書' },
]

export default function SkillSheetUpload({ engineer }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [uploading, setUploading] = useState<FileType | null>(null)
  const [deleting, setDeleting] = useState<FileType | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<FileType | null>(null)
  const [paths, setPaths] = useState({
    skill_sheet_real_path: engineer.skill_sheet_real_path,
    skill_sheet_initials_path: engineer.skill_sheet_initials_path,
    resume_real_path: engineer.resume_real_path,
  })
  const realRef = useRef<HTMLInputElement>(null)
  const initialsRef = useRef<HTMLInputElement>(null)
  const resumeRealRef = useRef<HTMLInputElement>(null)

  function getRef(type: FileType) {
    if (type === 'real') return realRef
    if (type === 'initials') return initialsRef
    return resumeRealRef
  }

  async function handleUpload(type: FileType, file: File) {
    setUploading(type)
    const pathField = type === 'real' ? 'skill_sheet_real_path'
      : type === 'initials' ? 'skill_sheet_initials_path'
      : 'resume_real_path'
    const ext = file.name.split('.').pop()
    const path = `${engineer.id}/${type}.${ext}`

    const existingPath = paths[pathField]
    if (existingPath) {
      await supabase.storage.from('skill-sheets').remove([existingPath])
    }

    const { error: uploadError } = await supabase.storage
      .from('skill-sheets')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      alert('アップロードに失敗しました: ' + uploadError.message)
      setUploading(null)
      return
    }

    const { error: updateError } = await supabase
      .from('engineers')
      .update({ [pathField]: path })
      .eq('id', engineer.id)

    if (updateError) {
      alert('保存に失敗しました: ' + updateError.message)
    } else {
      setPaths(prev => ({ ...prev, [pathField]: path }))
      router.refresh()
    }
    setUploading(null)
  }

  async function handleDelete(type: FileType) {
    setDeleting(type)
    setConfirmDelete(null)
    const pathField = type === 'real' ? 'skill_sheet_real_path'
      : type === 'initials' ? 'skill_sheet_initials_path'
      : 'resume_real_path'
    const path = paths[pathField]

    if (path) {
      await supabase.storage.from('skill-sheets').remove([path])
    }

    const { error } = await supabase
      .from('engineers')
      .update({ [pathField]: null })
      .eq('id', engineer.id)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
    } else {
      setPaths(prev => ({ ...prev, [pathField]: null }))
      router.refresh()
    }
    setDeleting(null)
  }

  async function handleDownload(path: string, label: string) {
    const { data, error } = await supabase.storage
      .from('skill-sheets')
      .createSignedUrl(path, 60)
    if (error || !data) {
      alert('ダウンロードに失敗しました')
      return
    }
    const a = document.createElement('a')
    a.href = data.signedUrl
    a.download = `スキルシート_${engineer.name}_${label}`
    a.click()
  }

  function renderFileRow(type: FileType, label: string, pathField: keyof typeof paths, description: string) {
    const path = paths[pathField]
    const isUploading = uploading === type
    const isDeleting = deleting === type
    const isConfirming = confirmDelete === type
    const fileName = path ? path.split('/').pop() : null

    return (
      <div key={type} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-slate-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
            {path && (
              <p className="text-xs text-blue-600 mt-0.5 truncate">{fileName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {path ? (
              <>
                <button
                  type="button"
                  onClick={() => handleDownload(path, label)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />DL
                </button>
                <button
                  type="button"
                  onClick={() => getRef(type).current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  更新
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(type)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  削除
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => getRef(type).current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-500 bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploading ? 'アップロード中...' : 'アップロード'}
              </button>
            )}
          </div>
        </div>

        {isConfirming && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 flex-1">本当に削除しますか？</p>
            <button
              type="button"
              onClick={() => handleDelete(type)}
              className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="text-xs text-slate-600 hover:text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        )}

        <input
          ref={getRef(type)}
          type="file"
          className="hidden"
          accept=".pdf,.xlsx,.xls,.csv,.docx,.doc"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleUpload(type, file)
            e.target.value = ''
          }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-700 mb-4">スキルシートファイル</h3>
        <div className="space-y-4">
          {SHEETS.map(({ type, label, pathField, description }) =>
            renderFileRow(type, label, pathField, description)
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-4">履歴書ファイル</h3>
        <div className="space-y-4">
          {RESUMES.map(({ type, label, pathField, description }) =>
            renderFileRow(type, label, pathField, description)
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">対応形式: PDF, Excel, Word, CSV</p>
    </div>
  )
}
