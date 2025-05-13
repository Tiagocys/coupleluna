'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/')
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const {
      data: { session },
      error: loginErr,
    } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (loginErr || !session) {
      setError(loginErr?.message ?? 'Login failed')
      return
    }
  // 🚀 Redireciona sempre para a Home
    router.push('/')
  }

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Log In</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>
        <button
          type="button"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/login` },
            })
          }
          className="w-full mt-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          Log in with Google
        </button>
      </form>
    </main>
  )
}