export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Engineer, Project } from '@/types'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('daily_matches')
    .select('*, engineers(id, name, work_style, monthly_rate), projects(id, name, work_style, budget_min, budget_max, required_languages)')
    .eq('run_date', today)
    .eq('dismissed', false)
    .order('score', { ascending: false })
    .limit(20)

  return NextResponse.json({ matches: data ?? [] })
}

export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: engineers }, { data: projects }] = await Promise.all([
    supabase.from('engineers').select('*').eq('status', '待機中'),
    supabase.from('projects').select('*').eq('status', '募集中'),
  ])

  if (!engineers?.length || !projects?.length) {
    return NextResponse.json({ message: 'マッチング対象なし', count: 0 })
  }

  const engList = engineers as Engineer[]
  const projList = projects as Project[]

  const prompt = `以下の待機中エンジニアと募集中案件の全組み合わせをスコアリングしてください。

## エンジニア一覧
${engList.map((e, i) => `[E${i+1}] ID:${e.id} 名前:${e.name} 言語:${e.languages.map(l=>l.name).join(',')||'なし'} FW:${e.frameworks.map(f=>f.name).join(',')||'なし'} クラウド:${e.cloud_environments.map(c=>c.name).join(',')||'なし'} DB:${e.db_skills.map(d=>d.name).join(',')||'なし'} ツール:${e.tools.map(t=>t.name).join(',')||'なし'} 単価:${e.monthly_rate??'不明'} 稼働:${e.work_style??'不明'}`).join('\n')}

## 案件一覧
${projList.map((p, i) => `[P${i+1}] ID:${p.id} 名前:${p.name} 必須:${p.required_languages.map(l=>l.name).join(',')} 予算:${p.budget_max??'不明'} 稼働:${p.work_style??'不明'}`).join('\n')}

## 指示
スコア60以上の組み合わせを最大10件選び、JSONで返してください。
{"matches":[{"engineer_id":"...","project_id":"...","score":85,"reasons":["理由1","理由2"],"mismatches":["不一致1"]}]}`

  try {
    const message = await bedrock.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{"matches":[]}')

    if (parsed.matches?.length) {
      const rows = parsed.matches.map((m: { engineer_id: string; project_id: string; score: number; reasons: string[]; mismatches: string[] }) => ({
        run_date: today,
        engineer_id: m.engineer_id,
        project_id: m.project_id,
        score: m.score,
        reasons_json: m.reasons ?? [],
        mismatches_json: m.mismatches ?? [],
        dismissed: false,
      }))
      await supabase.from('daily_matches').delete().eq('run_date', today)
      await supabase.from('daily_matches').insert(rows)
    }

    return NextResponse.json({ message: 'マッチング完了', count: parsed.matches?.length ?? 0 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
