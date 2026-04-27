export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('pdf') as File | null

  if (!file) {
    return NextResponse.json({ error: 'PDFファイルがありません' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  const prompt = `このPDFはエンジニアのスキルシートです。以下の項目を抽出してJSONで返してください。

抽出する項目:
- name: 氏名（文字列）
- age: 年齢（数値、不明なら null）
- nearest_station: 最寄り駅・地域（文字列、不明なら null）
- monthly_rate: 単価（円/月の数値、不明なら null）
- work_style: 稼働形態（"フルリモート"/"ハイブリッド"/"常駐"のいずれか、不明なら null）
- available_from: 参画タイミング（文字列、不明なら null）
- skill_summary: スキル概要（文字列、PDFの内容を要約）
- languages: 言語スキル（配列）[{"name": "Java", "years": 5}]
- frameworks: フレームワーク（配列）[{"name": "Spring Boot", "years": 3}]
- cloud_environments: クラウド環境（配列）[{"name": "AWS", "years": 2}]

JSONのみを返してください（説明文なし）。`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const engineer = JSON.parse(jsonMatch?.[0] ?? '{}')
    return NextResponse.json({ engineer })
  } catch {
    return NextResponse.json({ engineer: {} })
  }
}
