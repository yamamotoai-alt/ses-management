export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const formData = await req.formData()
    const jsonStr = formData.get('data') as string
    const file = formData.get('file') as File | null

    const body = JSON.parse(jsonStr)

    const payload = {
      name: body.name ?? '',
      initials: body.initials || null,
      title: null,
      age: body.age ? Number(body.age) : null,
      nearest_station: body.nearest_station || null,
      monthly_rate: body.monthly_rate ? Math.round(Number(body.monthly_rate) * 10000) : null,
      client_rate: null,
      work_style: body.work_style || null,
      available_from: body.available_from || null,
      email: body.email || null,
      phone: body.phone || null,
      nationality: body.nationality || null,
      working_hours: body.working_hours || null,
      desired_project: body.desired_project || null,
      skill_summary: body.skill_summary || null,
      notes: body.notes || null,
      languages: body.languages ?? [],
      frameworks: body.frameworks ?? [],
      cloud_environments: body.cloud_environments ?? [],
      db_skills: body.db_skills ?? [],
      os_environments: body.os_environments ?? [],
      tools: body.tools ?? [],
      other_skills: body.other_skills ?? [],
      status: '待機中',
      inflow_source: 'ヒアリングフォーム',
    }

    const { data: inserted, error } = await supabase
      .from('engineers')
      .insert(payload)
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const engineerId = inserted.id

    // ファイルをStorageにアップロード
    if (file) {
      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${engineerId}/resume.${ext}`
      const arrayBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('skill-sheets')
        .upload(path, arrayBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (!uploadError) {
        await supabase
          .from('engineers')
          .update({ skill_sheet_real_path: path })
          .eq('id', engineerId)
      }
    }

    // AIでtitleを生成
    try {
      const languages = (body.languages ?? []).map((l: { name: string }) => l.name).join('、')
      const frameworks = (body.frameworks ?? []).map((f: { name: string }) => f.name).join('、')
      const prompt = `以下のエンジニア情報をもとに、スキルシートに記載する簡潔な肩書き・職種タイトルを日本語で1行で生成してください。

氏名: ${body.name}
言語: ${languages || 'なし'}
フレームワーク: ${frameworks || 'なし'}
自己PR: ${body.skill_summary || 'なし'}
希望案件: ${body.desired_project || 'なし'}

出力形式の例:
- Javaバックエンドエンジニア 10年 / Spring Boot / AWS
- フルスタックエンジニア / React・Next.js・TypeScript
- Pythonエンジニア / データ分析・機械学習

タイトルのみを返してください（説明文・記号不要）。`

      const message = await bedrock.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      })

      const title = message.content[0].type === 'text' ? message.content[0].text.trim() : null

      if (title) {
        await supabase.from('engineers').update({ title }).eq('id', engineerId)
      }
    } catch {
      // title生成失敗は無視して続行
    }

    // LINE通知
    try {
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
      const groupId = process.env.LINE_GROUP_ID
      if (token && groupId) {
        const rate = body.monthly_rate ? `${body.monthly_rate}万円` : '未設定'
        const skills = [
          ...(body.languages ?? []),
          ...(body.frameworks ?? []),
        ].map((s: { name: string }) => s.name).slice(0, 5).join('・') || 'なし'
        const text = `📋 新規エンジニア登録\n氏名: ${body.name}\n単価: ${rate}\n稼働: ${body.work_style || '未設定'}\n主要スキル: ${skills}`
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
