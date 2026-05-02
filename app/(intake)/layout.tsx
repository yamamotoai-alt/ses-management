export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white font-bold text-lg">Nexus Advisors</h1>
          <p className="text-slate-400 text-xs mt-0.5">エンジニア登録フォーム</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="mt-16 pb-8 text-center text-xs text-slate-400">
        © Nexus Advisors｜お問い合わせ: contact@nexusadvisors.co.jp
      </footer>
    </div>
  )
}
