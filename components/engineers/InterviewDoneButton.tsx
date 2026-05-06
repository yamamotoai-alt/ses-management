'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function InterviewDoneButton({ engineerId }: { engineerId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirm('この方の事前面談を完了としてよろしいですか？')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/engineers/${engineerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewed: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(`更新に失敗しました: ${data.error ?? res.statusText}`)
        return
      }
      router.refresh()
    } catch (e) {
      alert(`エラーが発生しました: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      面談完了にする
    </button>
  )
}
