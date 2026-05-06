export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Engineer, Project } from '@/types'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

const CHUNK_SIZE = 1

const SYSTEM_PROMPT = `SES人材マッチングAIです。案件情報とエンジニア情報を比較し適性率を算出します。

ハードフィルター（該当時はscore=0、rank=E）:
1. フルリモート希望エンジニアへの常駐案件のみ0点。ハイブリッド・常駐希望は交渉余地あり0点にしない
2. 必須要件の過半数スキルが明確に不足かつ補完不可（経験年数は除外）
3. 案件に年齢制限があり条件未満

採点（合計100点）: 必須スキル35 / 歓迎スキル10 / 単価15 / 稼働形態・場所15 / 参画時期10 / キャリア適合10 / 提案リスク5

ランク: S=90-100 / A=80-89 / B=70-79 / C=60-69 / D=50-59 / E=0-49

情報不足は推測で0点にしない。不明点はエンジニアに有利に解釈。

JSON形式のみで出力（説明文不要）:
{"ranking":[{"id":"","engineer_name_or_identifier":"","matching_score":0,"matching_rank":"","recommendation":"","summary":"","score_breakdown":{"required_skill_match":{"score":0,"max_score":35,"reason":""},"preferred_skill_match":{"score":0,"max_score":10,"reason":""},"price_match":{"score":0,"max_score":15,"reason":""},"work_style_and_location_match":{"score":0,"max_score":15,"reason":""},"availability_match":{"score":0,"max_score":10,"reason":""},"career_and_project_fit":{"score":0,"max_score":10,"reason":""},"business_risk_match":{"score":0,"max_score":5,"reason":""}},"matched_points":[],"concerns":[],"proposal_talk_track":"","final_judgement":""}]}`

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(_req.url)
  const page = parseInt(url.searchParams.get('page') ?? '0')

  const supabase = await createClient()

  const [{ data: project }, { data: engineers }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('engineers')
      .select('id, name, initials, username, age, monthly_rate, client_rate, work_style, available_from, languages, frameworks, cloud_environments, db_skills, tools, other_skills, desired_project')
      .eq('status', '待機中')
      .range(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE - 1),
  ])

  if (!project || !engineers?.length) {
    return NextResponse.json({ results: [], hasMore: false })
  }

  const proj = project as Project
  const engineerList = engineers as unknown as Engineer[]

  const userPrompt = `以下の案件に対して、各エンジニアの適性率を評価してください。

【案件情報】
${JSON.stringify({
  案件名: proj.name,
  稼働形態: proj.work_style,
  勤務場所: proj.work_location,
  予算上限: proj.budget_max ?? null,
  予算下限: proj.budget_min ?? null,
  必須要件: proj.required_requirements ? String(proj.required_requirements).slice(0, 300) : '',
  歓迎要件: proj.preferred_requirements ? String(proj.preferred_requirements).slice(0, 150) : '',
})}

【エンジニア一覧】
${engineerList.map(e => JSON.stringify({
  id: e.id,
  名前: e.initials || e.username || e.name,
  年齢: e.age ?? null,
  単価: e.client_rate ?? e.monthly_rate ?? null,
  稼働形態: e.work_style,
  参画タイミング: e.available_from,
  スキル: [
    ...e.languages.map(l => l.name),
    ...e.frameworks.map(f => f.name),
    ...e.cloud_environments.map(c => c.name),
    ...e.db_skills.map(d => d.name),
    ...e.tools.map(t => t.name),
    ...e.other_skills.map(s => s.name),
  ].join(', '),
})).join('\n')}

スコア1以上のエンジニアをすべてrankingに含め、スコア降順でランク付けしてください。`

  const message = await bedrock.messages.create({
    model: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{}')
    const results = (parsed.ranking ?? []).map((r: any) => ({
      id: r.id,
      name: r.engineer_name_or_identifier,
      score: r.matching_score,
      rank: r.matching_rank,
      recommendation: r.recommendation,
      summary: r.summary,
      reason: r.final_judgement || r.summary,
      matched_points: r.matched_points ?? [],
      concerns: r.concerns ?? [],
      proposal_talk_track: r.proposal_talk_track,
      score_breakdown: r.score_breakdown,
    }))
    return NextResponse.json({ results, hasMore: engineers.length === CHUNK_SIZE })
  } catch {
    return NextResponse.json({ results: [], hasMore: false })
  }
}
