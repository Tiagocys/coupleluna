import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ verification_requested: false, verified: true })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Enviar email de notificação (exemplo com SendGrid ou similar):

  // await sendEmail({
  //   to: user.email,
  //   subject: 'Your identity has been verified',
  //   text: 'Congratulations, your identity verification was approved!',
  // })

  return NextResponse.json({ success: true })
}
