'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'

export default function PartnerDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('partner_companies').delete().eq('id', id)
    if (error) {
      alert('削除に失敗しました: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/partners')
      router.refresh()
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">本当に削除しますか？</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          削除する
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-sm text-slate-600 hover:text-slate-800 border border-slate-300 px-3 py-2 rounded-lg transition-colors"
        >
          キャンセル
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" /> 削除
    </button>
  )
}
