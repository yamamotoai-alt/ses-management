export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Engineer, Project } from '@/types'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: engineer }, { data: projects }] = await Promise.all([
    supabase.from('engineers').select('*').eq('id', id).single(),
    supabase.from('projects').select('*').eq('status', '募集中'),
  ])

  if (!engineer || !projects?.length) {
    return NextResponse.json({ results: [] })
  }

  const eng = engineer as Engineer
  const projectList = projects as Project[]

  const prompt = `以下のエンジニアに最もマッチする案件をJSONで返してください。

## エンジニア情報
氏名: ${eng.name}
スキル言語: ${eng.languages.map(l => `${l.name}(${l.years}年)`).join(', ') || 'なし'}
フレームワーク: ${eng.frameworks.map(f => `${f.name}(${f.years}年)`).join(', ') || 'なし'}
クラウド: ${eng.cloud_environments.map(c => `${c.name}(${c.years}年)`).join(', ') || 'なし'}
単価: ${eng.monthly_rate ? eng.monthly_rate.toLocaleString() + '円/月' : '未設定'}
稼働形態: ${eng.work_style || '未設定'}
参画タイミング: ${eng.available_from || '未設定'}
スキル概要: ${eng.skill_summary || 'なし'}

## 募集中の案件一覧
${projectList.map((p, i) => `
[${i + 1}] ID: ${p.id}
案件名: ${p.name}
必須言語: ${p.required_languages.map(l => `${l.name}(${l.years}年+)`).join(', ') || 'なし'}
必須FW: ${p.required_frameworks.map(f => `${f.name}(${f.years}年+)`).join(', ') || 'なし'}
クラウド: ${p.required_cloud.map(c => `${c.name}(${c.years}年+)`).join(', ') || 'なし'}
予算: ${p.budget_min ? p.budget_min.toLocaleString() : '?'}〜${p.budget_max ? p.budget_max.toLocaleString() : '?'}円/月
稼働形態: ${p.work_style || '未設定'}
必要経験: ${p.required_experience_years ? p.required_experience_years + '年以上' : '未設定'}
概要: ${p.description || 'なし'}
`).join('\n')}

## 指示
上記エンジニアに対して、マッチ度スコア(0-100)と理由を含む最大5件の案件をJSONで返してください。
スコアが高い順に並べてください。スコアが30未満の案件は含めないでください。

レスポンス形式（JSONのみ、説明文なし）:
{
  "results": [
    {
      "id": "案件のID（UUID）",
      "name": "案件名",
      "score": 85,
      "reason": "マッチする理由（100字程度）"
    }
  ]
}`

  const message = await bedrock.messages.create({
    model: CLAUDE_MODEL,
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
