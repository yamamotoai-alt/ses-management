export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()

    // 1. プロジェクトを作成
    const projectPayload = {
      name: body.name ?? '',
      introducer: body.company_name || null,
      budget_min: body.budget_min ? Math.round(Number(body.budget_min) * 10000) : null,
      budget_max: body.budget_max ? Math.round(Number(body.budget_max) * 10000) : null,
      duration: body.duration || null,
      work_style: body.work_style || null,
      work_location: body.work_location || null,
      work_hours: body.work_hours || null,
      interview_count: body.interview_count || null,
      required_experience_years: body.required_experience_years ? Number(body.required_experience_years) : null,
      required_requirements: body.required_requirements || null,
      preferred_requirements: body.preferred_requirements || null,
      description: body.description || null,
      project_content: body.project_content || null,
      project_notes: body.project_notes || null,
      required_languages: [],
      required_frameworks: [],
      required_cloud: [],
      optional_languages: [],
      optional_frameworks: [],
      optional_cloud: [],
      status: '募集中',
      source: 'パートナー提案',
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectPayload)
      .select('id')
      .single()

    if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 })

    // 2. 対象エンジニアがいれば提案パイプラインに追加
    if (body.engineer_id) {
      const proposalPayload = {
        engineer_id: body.engineer_id,
        project_id: project.id,
        status: '提案準備',
        channel: 'パートナーからの提案',
        partner_company_name: body.company_name || null,
        partner_contact_name: body.contact_name || null,
        partner_contact_email: body.contact_email || null,
      }
      const { error: proposalError } = await supabase.from('proposals').insert(proposalPayload)
      if (proposalError) return NextResponse.json({ error: proposalError.message }, { status: 500 })
    }

    // LINE通知
    try {
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
      const groupId = process.env.LINE_GROUP_ID
      if (token && groupId) {
        const engineerInfo = body.engineer_id ? `対象エンジニアあり` : 'エンジニア未指定'
        const budget = body.budget_min || body.budget_max
          ? `${body.budget_min ?? '?'}〜${body.budget_max ?? '?'}万円`
          : '未設定'
        const text = `🤝 パートナー企業から案件提案\n提案元: ${body.company_name || '不明'}\n担当者: ${body.contact_name || '不明'}\n案件名: ${body.name || '不明'}\n予算: ${budget}\n稼働: ${body.work_style || '未設定'}\n${engineerInfo}`
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ to: groupId, messages: [{ type: 'text', text }] }),
        })
      }
    } catch {
      // LINE通知失敗は無視して続行
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
