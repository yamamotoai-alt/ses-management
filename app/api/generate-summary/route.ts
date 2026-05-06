export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { bedrock } from '@/lib/anthropic'
import { Engineer } from '@/types'

const SYSTEM_PROMPT = `あなたはSES企業に応募してきたエンジニアのサポート担当です。
営業補助として実際に応募してきたエンジニアのスキルシートをもとに相手企業に営業がしやすいように魅力的かつ嘘の内容にならないようスキルシート内の情報をそれぞれの項目に当てはめて抽出してください。
人物像・備考に関してはSESエンジニアとして相手の元請け企業に刺さりそうな文面で作成してください。
提供されたエンジニア情報を最大限活用し、情報が不足している項目は入力データから推測・補填して記載してください。
それでも内容を生成できない項目は、その項目ごと（ラベルも含めて）出力から削除してください。"記載なし"とは書かないこと。

【各項目の入力指示】
【タイトル】→エンジニアの情報から抽出して簡潔にまとめる。一目で興味を引く営業ワードを盛り込む
【氏名】→イニシャルと年齢を記載する
【最寄】→提供情報から正確に抽出する。なければ項目ごと削除
【所属】→弊社業務委託社員と記載する
【参画】→稼働可能時期の情報から記載する。なければ項目ごと削除
【単価】→「企業出し単価」の値をそのまま記載する（例: 75万円/月 → "75万"）。企業出し単価が未設定の場合は項目ごと削除。AIによる推測・算出は絶対にしないこと
【稼働】→稼働形態・稼働時間の情報から記載する。なければ項目ごと削除
■ エンジニア概要→エンジニア概要フィールドを中心に、スキル情報も活用してできるだけ詳しく記載する。情報が薄い場合はスキルから推測して補填する
■ テクニカルスキル→提供されたスキル情報を抜けなく全て記載する。スキルがない分類は項目ごと削除する
■ 人物像→人物像フィールドの情報を活用しつつ、営業先の企業がその人材を欲しくなるように濃く記載する。フィールドが空でもスキルや経歴から推測して必ず記載する
■ 備考→備考フィールドに注力すべき内容がある場合のみ記載。なければ項目ごと削除
■ 希望→希望案件フィールドから正確に抽出する。なければ項目ごと削除

出力フォーマット（このフォーマットのみ出力、前後に説明文不要）:
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
【タイトル】（ここに内容）
【氏名】（ここに内容）
【最寄】（ここに内容、なければこの行ごと削除）
【所属】弊社業務委託社員
【参画】（ここに内容、なければこの行ごと削除）
【単価】（ここに内容、なければこの行ごと削除）
【稼働】（ここに内容、なければこの行ごと削除）
■ エンジニア概要
（ここに内容）
■ テクニカルスキル
【言語】
（内容、スキルなければこのブロックごと削除）
【フレームワーク】
（内容、スキルなければこのブロックごと削除）
【クラウド】
（内容、スキルなければこのブロックごと削除）
【DB】
（内容、スキルなければこのブロックごと削除）
【ツール/環境】
（内容、スキルなければこのブロックごと削除）
■ 人物像
（ここに内容）
■ 備考
（ここに内容、なければ「■ 備考」ごと削除）
■ 希望
（ここに内容、なければ「■ 希望」ごと削除）
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const engineer = body.engineer as Engineer

  const skillLines: string[] = []
  if (engineer.languages.length > 0)
    skillLines.push(`言語: ${engineer.languages.map(l => `${l.name}(${l.years}年)`).join('、')}`)
  if (engineer.frameworks.length > 0)
    skillLines.push(`フレームワーク: ${engineer.frameworks.map(f => `${f.name}(${f.years}年)`).join('、')}`)
  if (engineer.cloud_environments.length > 0)
    skillLines.push(`クラウド: ${engineer.cloud_environments.map(c => `${c.name}(${c.years}年)`).join('、')}`)
  if (engineer.db_skills.length > 0)
    skillLines.push(`DB: ${engineer.db_skills.map(d => d.name).join('、')}`)
  if (engineer.os_environments.length > 0)
    skillLines.push(`OS: ${engineer.os_environments.map(o => o.name).join('、')}`)
  if (engineer.tools.length > 0)
    skillLines.push(`ツール: ${engineer.tools.map(t => t.name).join('、')}`)
  if (engineer.other_skills.length > 0)
    skillLines.push(`その他: ${engineer.other_skills.map(s => s.name).join('、')}`)

  const clientRateStr = engineer.client_rate
    ? `${Math.round(engineer.client_rate / 10000)}万円/月`
    : '未設定'

  const userPrompt = `以下のエンジニア情報からサマリーを作成してください。

【エンジニア情報】
氏名: ${engineer.initials ?? engineer.name}
年齢: ${engineer.age ?? '不明'}歳
最寄駅: ${engineer.nearest_station ?? '不明'}
所属: ${engineer.employment_type ?? '不明'}
稼働可能時期: ${engineer.available_from ?? '不明'}
企業出し単価（【単価】欄にそのまま使用すること）: ${clientRateStr}
稼働形態: ${engineer.work_style ?? '不明'}
稼働時間: ${engineer.working_hours ?? '不明'}
スキル概要:
${skillLines.join('\n') || 'なし'}
エンジニア概要: ${engineer.skill_summary ?? 'なし'}
人物像: ${engineer.personality ?? 'なし'}
備考: ${engineer.notes ?? 'なし'}
希望案件: ${engineer.desired_project ?? 'なし'}`

  try {
    const message = await bedrock.messages.create({
      model: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ summary: text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'AI生成エラー' }, { status: 500 })
  }
}
