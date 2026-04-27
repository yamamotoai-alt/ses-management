export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { EXTRACT_PROJECTS_PROMPT } from '@/lib/prompts/extract-projects'
import { bedrock, CLAUDE_MODEL } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'textは必須です' }, { status: 400 })

    const message = await bedrock.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: `${EXTRACT_PROJECTS_PROMPT}\n\n---\n${text}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{"projects":[]}')
    return NextResponse.json({ projects: parsed.projects ?? [] })
  } catch (e) {
    console.error('extract-projects error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
