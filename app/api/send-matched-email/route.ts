export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { matchedProjectsIntroEmail, matchedEngineersIntroEmail } from '@/lib/emailTemplates'
import { Engineer, Project } from '@/types'

const FROM = 'onboarding@resend.dev'

// エンジニア詳細ページ: マッチした案件をエンジニア本人に紹介
// POST /api/send-matched-email/engineer
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY が設定されていません' }, { status: 500 })

  const body = await req.json()
  const { mode, engineerId, projectIds, partnerIds, useInitials } = body

  const supabase = await createClient()
  const resend = new Resend(apiKey)

  if (mode === 'engineer_to_projects') {
    // エンジニアにマッチした案件を紹介メール送信
    const [{ data: engineer }, { data: projects }] = await Promise.all([
      supabase.from('engineers').select('*').eq('id', engineerId).single(),
      supabase.from('projects').select('*').in('id', projectIds),
    ])

    if (!engineer || !engineer.email) {
      return NextResponse.json({ error: 'エンジニアのメールアドレスが登録されていません' }, { status: 400 })
    }
    if (!projects?.length) {
      return NextResponse.json({ error: '案件が見つかりません' }, { status: 400 })
    }

    const eng = engineer as Engineer
    const html = matchedProjectsIntroEmail(eng.name, projects as Project[])

    try {
      const { data, error } = await resend.emails.send({
        from: `Nexus Advisors <${FROM}>`,
        to: [eng.email!],
        subject: `【案件紹介】マッチした案件が${projects.length}件あります`,
        html,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, id: data?.id })
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 })
    }
  }

  if (mode === 'project_to_engineers') {
    // 協業企業にマッチしたエンジニアを紹介メール送信（複数企業）
    const [{ data: project }, { data: engineers }, { data: partners }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', body.projectId).single(),
      supabase.from('engineers').select('*').in('id', body.engineerIds),
      supabase.from('partner_companies').select('*').in('id', partnerIds),
    ])

    if (!project) return NextResponse.json({ error: '案件が見つかりません' }, { status: 400 })
    if (!engineers?.length) return NextResponse.json({ error: 'エンジニアが見つかりません' }, { status: 400 })
    if (!partners?.length) return NextResponse.json({ error: '協業企業が見つかりません' }, { status: 400 })

    const html = matchedEngineersIntroEmail(engineers as Engineer[], (project as Project).name, useInitials ?? true)
    const targets = (partners as { id: string; company_name: string; email: string | null }[]).filter(p => p.email)

    const results = await Promise.all(targets.map(async p => {
      try {
        const { data, error } = await resend.emails.send({
          from: `Nexus Advisors <${FROM}>`,
          to: [p.email!],
          subject: `【エンジニア紹介】${(project as Project).name} にマッチしたエンジニアのご紹介`,
          html,
        })
        return { id: p.id, ok: !error, emailId: data?.id }
      } catch {
        return { id: p.id, ok: false }
      }
    }))

    return NextResponse.json({ ok: true, results })
  }

  return NextResponse.json({ error: 'mode が不正です' }, { status: 400 })
}
