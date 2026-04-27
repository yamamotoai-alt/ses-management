export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const projectId = new URL(req.url).searchParams.get('project_id')
  if (!projectId) return NextResponse.json({ chains: [] })
  const { data } = await supabase
    .from('project_distribution_chain')
    .select('*')
    .eq('project_id', projectId)
    .order('layer_order')
  return NextResponse.json({ chains: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from('project_distribution_chain').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chain: data })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { projectId, chains } = await req.json()
  await supabase.from('project_distribution_chain').delete().eq('project_id', projectId)
  if (chains?.length) {
    await supabase.from('project_distribution_chain').insert(chains.map((c: { layer_order: number; company_name: string; unit_price_lower: number | null; unit_price_upper: number | null; is_self: boolean }) => ({ ...c, project_id: projectId }))
    )
  }
  return NextResponse.json({ ok: true })
}
