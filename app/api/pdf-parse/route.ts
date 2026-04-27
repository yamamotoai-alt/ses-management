export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('pdf') as File | null

  if (!file) {
    return NextResponse.json({ error: 'PDFファイルがありません' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)

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

  try {
    const message = await bedrock.messages.create({
      model: CLAUDE_MODEL,
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
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const engineer = JSON.parse(jsonMatch?.[0] ?? '{}')
    return NextResponse.json({ engineer })
  } catch (e) {
    console.error('pdf-parse error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
