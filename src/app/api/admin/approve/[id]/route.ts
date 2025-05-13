// src/app/api/admin/approve/[id]/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import supabase from '../../../../../../lib/supabase'

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  // autentica usuário admin, se necessário
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // atualiza o perfil para verified = true e limpa verification_requested
  const { error } = await supabase
    .from('profiles')
    .update({ verified: true, verification_requested: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
