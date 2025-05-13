'use client'

import { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const isSubmitting = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Please fill in both email and password.')
      setLoading(false)
      isSubmitting.current = false
      return
    }

    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)
    if (signErr || !data.user) {
      setError(signErr?.message ?? 'Signup failed')
      isSubmitting.current = false
      return
    }

    // <-- upsert fora de qualquer condição de session
    const userId = data.user.id
    const username = email.split('@')[0]
    await supabase.from('profiles').upsert(
      {
        id: userId,
        username,
        display_name: username,
        profile_completed: false,
        verification_requested: false,
        avatar_url: null,
      },
      { onConflict: 'id' }
    )

    // Auto‐login já ocorreu; manda todo mundo pra Home
    router.push('/')

    isSubmitting.current = false
  }


  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create an Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Account'}
        </button>
        <button
          type="button"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/complete-profile`,
              },
            })
          }
          className="w-full mt-4 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Sign up with Google
        </button>

      </form>
    </main>
  )
}
