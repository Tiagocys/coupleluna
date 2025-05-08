// src/app/api/signup/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Os campos email e password são obrigatórios.' },
        { status: 400 }
      )
    }

    // cria o usuário no Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Falha ao criar usuário.' },
        { status: 400 }
      )
    }

    const userId = authData.user.id
    // derive username do email (parte antes do @)
    const username = email.split('@')[0]

    // insere na tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        username,
        display_name: username,
      })

    if (profileError) {
      console.error('Erro ao inserir profile:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { user: authData.user },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Signup route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
