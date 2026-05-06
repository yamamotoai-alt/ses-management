export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Engineer, Project } from '@/types'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

const CHUNK_SIZE = 1

const SYSTEM_PROMPT = `SES人材マッチングAIです。エンジニア情報と案件情報を比較し適性率を算出します。

ハードフィルター（該当時はscore=0、rank=E）:
1. フルリモート希望エンジニアへの常駐案件のみ0点。ハイブリッド・常駐希望は交渉余地あり0点にしない
2. 必須要件の過半数スキルが明確に不足かつ補完不可（経験年数は除外）
3. 案件に年齢制限があり条件未満

採点（合計100点）: 必須スキル35 / 歓迎スキル10 / 単価15 / 稼働形態・場所15 / 参画時期10 / キャリア適合10 / 提案リスク5

ランク: S=90-100 / A=80-89 / B=70-79 / C=60-69 / D=50-59 / E=0-49

情報不足は推測で0点にしない。不明点はエンジニアに有利に解釈。

JSON形式のみで出力（説明文不要）:
{"results":[{"id":"","name":"","matching_score":0,"matching_rank":"","recommendation":"","summary":"","score_breakdown":{"required_skill_match":{"score":0,"max_score":35,"reason":""},"preferred_skill_match":{"score":0,"max_score":10,"reason":""},"price_match":{"score":0,"max_score":15,"reason":""},"work_style_and_location_match":{"score":0,"max_score":15,"reason":""},"availability_match":{"score":0,"max_score":10,"reason":""},"career_and_project_fit":{"score":0,"max_score":10,"reason":""},"business_risk_match":{"score":0,"max_score":5,"reason":""}},"matched_points":[],"concerns":[],"proposal_talk_track":"","final_judgement":""}]}`

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(_req.url)
  const page = parseInt(url.searchParams.get('page') ?? '0')

  const supabase = await createClient()

  const [{ data: engineer }, { data: projects }] = await Promise.all([
    supabase.from('engineers').select('*').eq('id', id).single(),
    supabase.from('projects')
      .select('id, name, work_style, required_requirements, preferred_requirements, budget_max, budget_min, work_location')
      .eq('status', '募集中')
      .range(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE - 1),
  ])

  if (!engineer) {
    return NextResponse.json({ results: [], hasMore: false })
  }
  if (!projects?.length) {
    return NextResponse.json({ results: [], hasMore: false })
  }

  const eng = engineer as Engineer
  const projectList = projects as unknown as Project[]

  const userPrompt = `以下のエンジニアに対して、各案件の適性率を評価してください。

【エンジニア情報】
${JSON.stringify({
  年齢: eng.age ?? null,
  稼働形態: eng.work_style,
  参画タイミング: eng.available_from,
  単価: eng.client_rate ?? eng.monthly_rate ?? null,
  スキル: [
    ...eng.languages.map(l => l.name),
    ...eng.frameworks.map(f => f.name),
    ...eng.cloud_environments.map(c => c.name),
    ...eng.db_skills.map(d => d.name),
    ...eng.tools.map(t => t.name),
    ...eng.other_skills.map(s => s.name),
  ].join(', '),
  希望案件: eng.desired_project ? String(eng.desired_project).slice(0, 100) : null,
})}

【案件一覧】
${projectList.map(p => JSON.stringify({
  id: p.id,
  案件名: p.name,
  稼働形態: p.work_style,
  勤務場所: p.work_location,
  予算上限: p.budget_max ?? null,
  予算下限: p.budget_min ?? null,
  必須要件: p.required_requirements ? String(p.required_requirements).slice(0, 200) : '',
  歓迎要件: p.preferred_requirements ? String(p.preferred_requirements).slice(0, 100) : '',
})).join('\n')}

スコア1以上の案件をすべて結果に含めてください。スコア降順で返してください。`

  let text = ''
  try {
    const message = await bedrock.messages.create({
      model: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    text = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (e: any) {
    return NextResponse.json({ results: [], hasMore: false, error: e?.message ?? 'bedrock error' }, { status: 500 })
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{"results":[]}')
    return NextResponse.json({
      results: parsed.results ?? [],
      hasMore: projects.length === CHUNK_SIZE,
    })
  } catch {
    return NextResponse.json({ results: [], hasMore: false, error: 'parse error', raw: text.slice(0, 200) })
  }
}
