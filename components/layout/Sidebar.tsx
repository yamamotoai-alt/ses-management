'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, Briefcase, LogOut, LayoutDashboard, X, GitBranch, Receipt, Building2, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'
import { type Role } from '@/lib/role'

const ALL_NAV_ITEMS = [
  { href: '/',          label: 'ダッシュボード',   icon: LayoutDashboard, roles: ['admin'] },
  { href: '/engineers', label: 'エンジニア管理',   icon: Users,           roles: ['admin', 'sales', 'partner'] },
  { href: '/projects',  label: '案件管理',         icon: Briefcase,       roles: ['admin', 'sales', 'partner'] },
  { href: '/pipeline',  label: '提案パイプライン', icon: GitBranch,       roles: ['admin', 'sales'] },
  { href: '/billing',   label: '請求管理',         icon: Receipt,         roles: ['admin'] },
  { href: '/partners',  label: '協業企業管理',     icon: Building2,       roles: ['admin'] },
  { href: '/kpi',       label: 'KPIダッシュボード',icon: BarChart2,       roles: ['admin'] },
]

const ROLE_LABELS: Record<Role, string> = {
  admin:   '管理者',
  sales:   '営業',
  partner: '協力企業',
}

interface Props {
  isOpen: boolean
  onClose: () => void
  role: Role
}

export default function Sidebar({ isOpen, onClose, role }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role))

  return (
    <aside
      className={clsx(
        'w-60 bg-slate-900 flex flex-col flex-shrink-0',
        'fixed inset-y-0 left-0 z-40 transition-transform duration-300',
        'md:sticky md:top-0 md:h-screen md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">SES管理ツール</h1>
          <p className="text-slate-400 text-xs mt-0.5">{ROLE_LABELS[role]}</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-white p-1"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/' && pathname.startsWith(href))
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
