export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const engineerId = searchParams.get('engineer_id')
  const projectId = searchParams.get('project_id')

  let query = supabase
    .from('proposals')
    .select('*, engineers(id, name, status, monthly_rate, work_style, available_from, languages, frameworks, cloud_environments), projects(id, name, status, budget_min, budget_max, required_languages, work_style)')
    .order('created_at', { ascending: false })

  if (engineerId) query = query.eq('engineer_id', engineerId)
  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ proposals: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from('proposals').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ proposal: data })
}
