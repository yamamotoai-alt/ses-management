import DashboardShell from '@/components/layout/DashboardShell'
import { getRole } from '@/lib/role'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole()
  return <DashboardShell role={role}>{children}</DashboardShell>
}
