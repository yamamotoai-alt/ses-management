'use client'

import { Engineer } from '@/types'
import { type Role } from '@/lib/role'
import { formatRate } from '@/lib/format'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { User, MapPin, Calendar } from 'lucide-react'

export default function EngineerList({ engineers, role = 'admin' }: { engineers: Engineer[]; role?: Role }) {
  if (engineers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">エンジニアが登録されていません</p>
        <Link href="/engineers/new" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          新規登録する →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {engineers.map(eng => {
        const displayName = role === 'partner' && eng.initials ? eng.initials : eng.name
        return (
        <Link
          key={eng.id}
          href={`/engineers/${eng.id}`}
          className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {displayName}
                </h3>
                <Badge variant={eng.status === '稼働中' ? 'green' : eng.status === '別企業で稼働' ? 'blue' : 'orange'}>
                  {eng.status}
                </Badge>
                {eng.work_style && (
                  <Badge variant="blue">{eng.work_style}</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {eng.nearest_station && role !== 'partner' && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {eng.nearest_station}
                  </span>
                )}
                {eng.monthly_rate && (
                  <span>希望 {formatRate(eng.monthly_rate)}</span>
                )}
                {eng.client_rate && role !== 'partner' && (
                  <span className="text-blue-600 font-medium">企業出し {formatRate(eng.client_rate)}</span>
                )}
                {eng.available_from && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {eng.available_from}〜
                  </span>
                )}
              </div>

              {eng.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {eng.languages.slice(0, 5).map(l => (
                    <span key={l.name} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                      {l.name}
                    </span>
                  ))}
                  {eng.languages.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-slate-400">+{eng.languages.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
        )
      })}
    </div>
  )
}
