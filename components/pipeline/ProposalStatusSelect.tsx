'use client'

import { useState } from 'react'
import { ProposalStatus, PROPOSAL_STATUSES } from '@/types'
import { Loader2 } from 'lucide-react'

export default function ProposalStatusSelect({
  proposalId,
  currentStatus,
}: {
  proposalId: string
  currentStatus: ProposalStatus
}) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(next: ProposalStatus) {
    setSaving(true)
    setStatus(next)
    await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2">
      {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      <select
        value={status}
        onChange={e => handleChange(e.target.value as ProposalStatus)}
        disabled={saving}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {PROPOSAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}
