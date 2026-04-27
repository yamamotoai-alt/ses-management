export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ENGINEER_PROMPT = `以下のテキストはエンジニアの情報です。次の項目を抽出してJSONで返してください。

抽出する項目:
- name: 氏名（文字列、不明なら null）
- age: 年齢（数値、不明なら null）
- nearest_station: 最寄り駅・地域（文字列、不明なら null）
- monthly_rate: 単価（円/月の数値、不明なら null）
- work_style: 稼働形態（"フルリモート"/"ハイブリッド"/"常駐"のいずれか、不明なら null）
- available_from: 参画タイミング（文字列、不明なら null）
- skill_summary: スキル概要（文字列、テキストの内容を要約）
- languages: 言語スキル（配列）[{"name": "Java", "years": 5}]
- frameworks: フレームワーク（配列）[{"name": "Spring Boot", "years": 3}]
- cloud_environments: クラウド環境（配列）[{"name": "AWS", "years": 2}]

JSONのみを返してください（説明文なし）。`

const PROJECT_PROMPT = `以下のテキストは開発案件の情報です。次の項目を抽出してJSONで返してください。

抽出する項目:
- name: 案件名（文字列、不明なら null）
- budget_min: 予算下限（円/月の数値、不明なら null）
- budget_max: 予算上限（円/月の数値、不明なら null）
- duration: 期間（文字列、例: "3ヶ月〜"、不明なら null）
- work_style: 稼働形態（"フルリモート"/"ハイブリッド"/"常駐"のいずれか、不明なら null）
- required_experience_years: 必要経験年数（数値、不明なら null）
- description: 案件概要（文字列、テキストの内容を要約）
- required_languages: 必須言語（配列）[{"name": "Java", "years": 3}]
- required_frameworks: 必須フレームワーク（配列）[{"name": "Spring Boot", "years": 2}]
- required_cloud: クラウド環境（配列）[{"name": "AWS", "years": 1}]

JSONのみを返してください（説明文なし）。`

export async function POST(req: NextRequest) {
  const { text, type } = await req.json()

  if (!text || !type) {
    return NextResponse.json({ error: 'textとtypeは必須です' }, { status: 400 })
  }

  const prompt = type === 'engineer' ? ENGINEER_PROMPT : PROJECT_PROMPT

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\n---\n${text}`,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch?.[0] ?? '{}')
    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ result: {} })
  }
}
