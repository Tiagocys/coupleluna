// src/app/api/admin/reject/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../../../../lib/send-email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { reason } = (await req.json()) as { reason: string }

  // 1) Limpa a solicitação
  const { error: updErr } = await supabaseAdmin
    .from('profiles')
    .update({ verification_requested: false })
    .eq('id', id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 400 })
  }

  // 2) Busca o e-mail do usuário em auth.users
  const { data: userRow, error: userErr } = await supabaseAdmin
    .from('auth.users')
    .select('email')
    .eq('id', id)
    .single()
  if (userErr || !userRow?.email) {
    console.error('Could not fetch user email:', userErr)
    // Mesmo que falhe, podemos continuar sem enviar o e-mail
    return NextResponse.json({ success: true })
  }
  const userEmail = userRow.email

  // 3) Envia o e-mail de rejeição
  await sendEmail({
    to: userEmail,
    subject: 'Your identity verification was rejected',
    text: `We’re sorry. Your verification request was rejected because: ${reason}`,
  })

  return NextResponse.json({ success: true })
}
