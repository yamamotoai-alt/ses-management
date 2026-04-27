export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { Engineer, Project } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: project }, { data: engineers }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', params.id).single(),
    supabase.from('engineers').select('*').eq('status', '待機中'),
  ])

  if (!project || !engineers?.length) {
    return NextResponse.json({ results: [] })
  }

  const proj = project as Project
  const engineerList = engineers as Engineer[]

  const prompt = `以下の案件に最もマッチするエンジニアをJSONで返してください。

## 案件情報
案件名: ${proj.name}
必須言語: ${proj.required_languages.map(l => `${l.name}(${l.years}年+)`).join(', ') || 'なし'}
必須FW: ${proj.required_frameworks.map(f => `${f.name}(${f.years}年+)`).join(', ') || 'なし'}
クラウド: ${proj.required_cloud.map(c => `${c.name}(${c.years}年+)`).join(', ') || 'なし'}
予算: ${proj.budget_min ? proj.budget_min.toLocaleString() : '?'}〜${proj.budget_max ? proj.budget_max.toLocaleString() : '?'}円/月
稼働形態: ${proj.work_style || '未設定'}
必要経験: ${proj.required_experience_years ? proj.required_experience_years + '年以上' : '未設定'}
概要: ${proj.description || 'なし'}

## 待機中のエンジニア一覧
${engineerList.map((e, i) => `
[${i + 1}] ID: ${e.id}
氏名: ${e.name}
スキル言語: ${e.languages.map(l => `${l.name}(${l.years}年)`).join(', ') || 'なし'}
フレームワーク: ${e.frameworks.map(f => `${f.name}(${f.years}年)`).join(', ') || 'なし'}
クラウド: ${e.cloud_environments.map(c => `${c.name}(${c.years}年)`).join(', ') || 'なし'}
単価: ${e.monthly_rate ? e.monthly_rate.toLocaleString() + '円/月' : '未設定'}
稼働形態: ${e.work_style || '未設定'}
参画タイミング: ${e.available_from || '未設定'}
スキル概要: ${e.skill_summary || 'なし'}
`).join('\n')}

## 指示
上記案件に対して、マッチ度スコア(0-100)と理由を含む最大5件のエンジニアをJSONで返してください。
スコアが高い順に並べてください。スコアが30未満のエンジニアは含めないでください。

レスポンス形式（JSONのみ、説明文なし）:
{
  "results": [
    {
      "id": "エンジニアのID（UUID）",
      "name": "氏名",
      "score": 85,
      "reason": "マッチする理由（100字程度）"
    }
  ]
}`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{"results":[]}')
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ results: [] })
  }
}
