export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM = 'onboarding@resend.dev'

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY が設定されていません' }, { status: 500 })

  const body = await req.json()
  const { to, subject, html } = body

  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 })
  }

  const resend = new Resend(apiKey)

  try {
    const { data, error } = await resend.emails.send({
      from: `Nexus Advisors <${FROM}>`,
      to: [to],
      subject,
      html,
    })
    if (error) return NextResponse.json({ error: error.message, detail: JSON.stringify(error) }, { status: 500 })
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
