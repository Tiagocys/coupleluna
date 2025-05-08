import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente frontend, não usa a service role key
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Você pode devolver data.session ou data.user, conforme prefira
  return NextResponse.json({ session: data.session })
}
