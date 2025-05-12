'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase'

export default function CompleteProfilePage() {
  const [initializing, setInitializing] = useState(true)
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'verify'>('info')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    wantVerify: false,
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const access_token  = url.searchParams.get('access_token')
    const refresh_token = url.searchParams.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .catch((err: any) => console.error('setSession error', err))
        .finally(() => setInitializing(false))  // <— usa setInitializing
    } else {
      setInitializing(false)                    // <— idem
    }
  }, [])

  // 2) Só depois de initialized=false, valida a sessão
  useEffect(() => {
    if (initializing) return                     // <— usa initializing
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) router.push('/login')
      })
      .catch((err: any) => {
        console.error('getSession error', err)
        router.push('/login')
      })
  }, [initializing, router])

  // 3) **Novo**: carrega o profile e preenche o form
  useEffect(() => {
    if (initializing) return   // espera o fluxo de sessão finalizar

    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error.message)
        return
      }
      if (profile) {
        setForm(f => ({
          ...f,
          firstName: profile.display_name?.split(' ')[0] || '',
          lastName:  profile.display_name?.split(' ').slice(1).join(' ') || '',
          username:  profile.username ?? '',
        }))
      }
    }

    loadProfile()
  }, [initializing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'checkbox') setForm(f => ({ ...f, [name]: checked }))
    else if (files) setForm(f => ({ ...f, [name]: files[0] }))
    else setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.firstName || !form.lastName || !form.username) {
      return setError('Please complete all fields.')
    }
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    // Upsert em profiles
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(
        {
          id: session.user.id,
          display_name: `${form.firstName} ${form.lastName}`,
          username: form.username,
          profile_completed: true,
        },
        { onConflict: 'id' }
      )

    if (upsertErr) {
      setError(upsertErr.message)
      setLoading(false)
      return
    }

    if (form.wantVerify) {
      setStep('verify')
      setLoading(false)
    } else {
      // redirect sem mexer no loading (botão fica “Continuing…” até navegar)
      return router.push('/')
    }
  }

  const handleBack = () => setStep('info')
  const handleSubmitVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.idFront || !form.idBack || !form.selfie) {
      return setError('Please upload front, back of ID and a selfie.')
    }
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession();    
    const prefix = session.user.id; // só o UID

    for (const [key, file] of [
      ['idFront', form.idFront],
      ['idBack',  form.idBack],
      ['selfie',  form.selfie],
    ] as const) {
      const safeName = encodeURIComponent(file.name);
      const path     = `${prefix}/${key}-${safeName}`;

      const { error: upErr } = await supabase
        .storage
        .from('private-media')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (upErr) {
        setError(upErr.message);
        setLoading(false);
        return;
      }
    }
    // sinalizar pedido de verificação
    await supabase
      .from('profiles')
      .update({ verification_requested: true })
      .eq('id', session!.user.id)

    setLoading(false)
    router.push('/')
  }
  const firstName = form.firstName ?? ''
  const lastName  = form.lastName  ?? ''
  const username  = form.username  ?? ''
  return (
    <>
      <main className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>

        {step === 'info' ? (
          <form onSubmit={handleSubmitInfo} className="space-y-4">
            <div>
              <label>First Name</label>
              <input
                name="firstName"
                defaultValue={firstName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                disabled={loading}
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                name="lastName"
                defaultValue={lastName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                disabled={loading}
              />
            </div>
            <div>
              <label>Username</label>
              <input
                name="username"
                defaultValue={username}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                disabled={loading}
              />
            </div>
            <div className="flex items-center">
              <input
                id="wantVerify"
                name="wantVerify"
                type="checkbox"
                checked={form.wantVerify}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="wantVerify" className="ml-2">
                I want to verify my profile
              </label>
            </div>
            <p className="text-sm text-gray-600">
              If you choose to verify, you will be asked to upload ID documents and a selfie.
            </p>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitVerify} className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Verification Docs</h2>
            
            {/* ID Front */}
          <div className="mb-6">
            <label htmlFor="idFront" className="block font-medium mb-2">
              ID Front Photo
            </label>
            <div className="relative">
              <img
                src="/images/id-front.png"
                alt="Front of ID"
                className="pointer-events-none absolute left-2 top-1/2 w-16 h-16 -translate-y-1/2"
              />
              <input
                type="file"
                id="idFront"
                name="idFront"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-24 pr-4 py-3 border rounded"
              />
            </div>
          </div>

          {/* ID Back */}
          <div className="mb-6">
            <label htmlFor="idBack" className="block font-medium mb-2">
              ID Back Photo
            </label>
            <div className="relative">
              <img
                src="/images/id-back.png"
                alt="Back of ID"
                className="pointer-events-none absolute left-2 top-1/2 w-16 h-16 -translate-y-1/2"
              />
              <input
                type="file"
                id="idBack"
                name="idBack"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-24 pr-4 py-3 border rounded"
              />
            </div>
          </div>

          {/* Selfie */}
          <div className="mb-6">
            <label htmlFor="selfie" className="block font-medium mb-2">
              Selfie with ID
            </label>
            <div className="relative">
              <img
                src="/images/selfie-example.png"
                alt="Selfie holding ID"
                className="pointer-events-none absolute left-2 top-1/2 w-16 h-16 -translate-y-1/2"
              />
              <input
                type="file"
                id="selfie"
                name="selfie"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-24 pr-4 py-3 border rounded"
              />
            </div>
          </div>

            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Uploading…' : 'Submit Verification'}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  )
}
