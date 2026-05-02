import Link from 'next/link'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Nexus Advisors</h1>
            <p className="text-slate-400 text-xs mt-0.5">パートナー様向けポータル</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/partner/engineers" className="text-slate-300 hover:text-white text-sm transition-colors">
              エンジニア一覧
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="mt-16 pb-8 text-center text-xs text-slate-400">
        © Nexus Advisors｜お問い合わせ: contact@nexusadvisors.co.jp
      </footer>
    </div>
  )
}
