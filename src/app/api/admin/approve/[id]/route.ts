// src/app/api/admin/approve/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import supabase from '../../../../../../lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // opcional: verifique sessão/admin aqui
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('profiles')
    .update({ verified: true, verification_requested: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
