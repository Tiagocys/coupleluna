'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'info' | 'verify'>('info')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    wantVerify: false as boolean,
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  })
  const [error, setError] = useState<string | null>(null)

  // pega dados do profile atual, se houver
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) return router.push('/login')
      // opcional: carregar profile existente e preencher form
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setForm(f => ({
              ...f,
              firstName: profile.display_name?.split(' ')[0] || '',
              lastName: profile.display_name?.split(' ').slice(1).join(' ') || '',
              username: profile.username,
            }))
          }
        })
    })
  }, [])

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
      return setError('Please fill in all fields.')
    }
    setLoading(true)
    const {
      data: { session },
      error: err,
    } = await supabase.auth.getSession()
    if (!session) return router.push('/login')
    // atualiza profile
    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        display_name: form.firstName + ' ' + form.lastName,
        username: form.username,
      })//
      .eq('id', session.user.id)
    if (updErr) {
      setError(updErr.message)
      setLoading(false)
      return
    }
    await supabase
    .from('profiles')
    .update({ profile_completed: true })
    .eq('id', session.user.id)
    setLoading(false)
    // segue fluxo de verificação?
    if (form.wantVerify) setStep('verify')
    else router.push('/')
  }

  const handleSubmitVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.idFront || !form.idBack || !form.selfie) {
      return setError('Please upload all verification images.')
    }
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    // upload dos arquivos
    const prefix = `verifications/${session.user.id}`
    for (const [key, file] of [
    ['idFront', form.idFront],
    ['idBack', form.idBack],
    ['selfie', form.selfie],
    ] as const) {
    const path = `${prefix}/${key}-${file.name}`
    await supabase
        .storage
        .from('private-media')
        .upload(path, file, { cacheControl: '3600', upsert: true })
    }

    // atualiza profile com flag de verificação
    await supabase
      .from('profiles')
      .update({ verification_requested: true })
      .eq('id', session.user.id)

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="max-w-md mx-auto p-8">
      {step === 'info' ? (
        <form onSubmit={handleSubmitInfo} className="space-y-4">
          <h1 className="text-xl font-bold">Complete your profile</h1>
          <div>
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div>
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="wantVerify"
              checked={form.wantVerify}
              onChange={handleChange}
            />
            <label className="ml-2">I want to verify my profile</label>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button disabled={loading}>{loading ? 'Saving…' : 'Continue'}</button>
        </form>
      ) : (
        <form onSubmit={handleSubmitVerify} className="space-y-4">
          <h1 className="text-xl font-bold">Upload verification docs</h1>
          <div>
            <label>ID Front</label>
            <input type="file" name="idFront" accept="image/*" onChange={handleChange} />
          </div>
          <div>
            <label>ID Back</label>
            <input type="file" name="idBack" accept="image/*" onChange={handleChange} />
          </div>
          <div>
            <label>Selfie with ID</label>
            <input type="file" name="selfie" accept="image/*" onChange={handleChange} />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button disabled={loading}>{loading ? 'Uploading…' : 'Submit Verification'}</button>
        </form>
      )}
    </main>
  )
}
