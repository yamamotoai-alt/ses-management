import IntakeForm from '@/components/intake/IntakeForm'

export default function IntakePage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">エンジニア情報ご登録フォーム</h2>
        <p className="text-slate-500 text-sm">
          ご登録いただいた情報をもとに、マッチする案件をご紹介いたします。<br />
          ご不明な点は <span className="font-medium text-slate-700">contact@nexusadvisors.co.jp</span> までお問い合わせください。
        </p>
      </div>
      <IntakeForm />
    </div>
  )
}
