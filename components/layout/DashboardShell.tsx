'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { Menu } from 'lucide-react'
import { type Role } from '@/lib/role'

export default function DashboardShell({ children, role }: { children: React.ReactNode; role: Role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-800"
            aria-label="メニューを開く"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-slate-800 text-sm">SES管理ツール</span>
        </div>
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
