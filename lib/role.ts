import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'sales' | 'partner'

export async function getRole(): Promise<Role> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'partner'
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return (data?.role as Role) ?? 'sales'
}

export function canAccess(role: Role, path: string): boolean {
  if (role === 'admin') return true

  // partner は engineers・projects・login のみ
  if (role === 'partner') {
    return (
      path === '/' ||
      path.startsWith('/engineers') ||
      path.startsWith('/projects') ||
      path.startsWith('/login') ||
      path.startsWith('/api')
    )
  }

  // sales はbilling・kpi・partnersを除く全て
  if (role === 'sales') {
    const blocked = ['/billing', '/kpi', '/partners']
    return !blocked.some(b => path.startsWith(b))
  }

  return false
}
