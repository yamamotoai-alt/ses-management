export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

const PROMPT = `あなたはITエンジニアのスキル分類の専門家です。
以下に入力されたスキル情報テキストを解析し、各スキルを適切なカテゴリに分類してください。

分類するカテゴリ:
- languages: プログラミング言語（Java, Python, TypeScript, PHP, Ruby, Go, C#, C++, Swift, Kotlin, Dart, Rust, Scala など）
- frameworks: フレームワーク・ライブラリ（Spring Boot, React, Next.js, Vue.js, Angular, Django, Rails, Laravel, Flutter など）
- cloud_environments: クラウド環境・サービス（AWS, GCP, Azure, Vercel, Firebase, Supabase など）
- db_skills: データベース（MySQL, PostgreSQL, Oracle, MongoDB, Redis, DynamoDB, SQLite, MariaDB など）
- os_environments: OS・インフラ（Linux, Windows, macOS, Ubuntu, CentOS, Docker, Kubernetes, Nginx など）
- tools: ツール・開発環境（Git, GitHub, GitLab, Jenkins, Jira, Slack, Figma, VSCode, IntelliJ, Terraform など）
- other_skills: その他スキル（Agile, Scrum, CI/CD, REST API, GraphQL, 英語, マネジメント など上記に当てはまらないもの）

ルール:
- 同じスキルを複数のカテゴリに入れない
- スキル名は一般的な表記に統一する（例: "js" → "JavaScript", "TS" → "TypeScript"）
- 経験年数の記述（"5年", "3年以上"等）は除いてスキル名のみ抽出する
- どのカテゴリにも当てはまらない文字列は無視する
- 各スキルは個別の要素として扱う（コンマや改行で連結しない）

以下のJSON形式のみで返してください（説明文・コードブロック不要）:
{
  "languages": ["TypeScript", "Python"],
  "frameworks": ["React", "Next.js"],
  "cloud_environments": ["AWS"],
  "db_skills": ["PostgreSQL"],
  "os_environments": ["Linux"],
  "tools": ["GitHub", "Docker"],
  "other_skills": ["Agile"]
}`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const message = await bedrock.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: `${PROMPT}\n\n入力テキスト:\n${text}` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch?.[0] ?? '{}')

    const empty: Record<string, string[]> = {
      languages: [], frameworks: [], cloud_environments: [],
      db_skills: [], os_environments: [], tools: [], other_skills: [],
    }
    return NextResponse.json({ result: { ...empty, ...result } })
  } catch (e) {
    console.error('skill-classify error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
