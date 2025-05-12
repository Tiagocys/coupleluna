'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabase'

export default function UploadVideoPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Gera thumbnail a partir do primeiro frame
  const generateThumbnail = () => {
    if (!videoRef.current) return null
    const video = videoRef.current
    video.currentTime = 0
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    return new Promise<File>((res) => {
      canvas.toBlob(blob => {
        res(new File([blob!], 'thumbnail.png', { type: 'image/png' }))
      }, 'image/png')
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !videoFile) {
      setError('Title and video are required.')
      return
    }
    if (videoFile.size > 50 * 1024 * 1024) {
      setError('Max video size is 50 MB.')
      return
    }
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return router.push('/login')
    const uid = session.user.id

    // paths únicos
    const ts = Date.now()
    const videoPath = `${uid}/videos/${ts}-${encodeURIComponent(videoFile.name)}`
    let thumbnailPath = `${uid}/thumbnails/${ts}-thumb.png`

    // se não escolheu thumb, gera
    let thumb = thumbFile
    if (!thumb) {
      thumb = await generateThumbnail()
    }

    // faz uploads em paralelo
    const [{ error: vidErr }, { error: thErr }] = await Promise.all([
      supabase.storage.from('videos').upload(videoPath, videoFile, { upsert: false }),
      supabase.storage.from('videos').upload(thumbnailPath, thumb!, { upsert: false }),
    ])
    if (vidErr || thErr) {
      setError(vidErr?.message || thErr?.message || 'Upload failed')
      setLoading(false)
      return
    }

    // grava a linha no banco
    const { error: dbErr } = await supabase
      .from('videos')
      .insert({
        user_id: uid,
        title: title.trim(),
        description: description.trim() || null,
        video_path: videoPath,
        thumbnail_path: thumbnailPath,
      })
    if (dbErr) {
      setError(dbErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Upload New Video</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1">Thumbnail (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1">Video (MP4 only) *</label>
          <input
            type="file"
            accept="video/mp4"
            onChange={e => setVideoFile(e.target.files?.[0] || null)}
            disabled={loading}
            required
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading…' : 'Upload Video'}
        </button>
      </form>

      {/* elemento oculto para geração de thumbnail */}
      <video
        ref={videoRef}
        className="hidden"
        src={videoFile ? URL.createObjectURL(videoFile) : undefined}
      />
    </main>
  )
}
