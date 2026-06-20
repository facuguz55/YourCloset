'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STYLE_OPTIONS = ['streetwear', 'casual', 'formal', 'sport', 'bohemio', 'minimalista']
const GENDER_OPTIONS = ['masculino', 'femenino', 'unisex']
const PRICE_OPTIONS = ['economico', 'medio', 'premium'] as const

interface StoreForm {
  name: string
  description: string
  address: string
  city: string
  phone_whatsapp: string
  email: string
  website_url: string
  style_tags: string[]
  gender_focus: string[]
  price_range: '' | typeof PRICE_OPTIONS[number]
  cover_image_url: string
}

const EMPTY: StoreForm = {
  name: '', description: '', address: '', city: 'Santa Fe',
  phone_whatsapp: '', email: '', website_url: '',
  style_tags: [], gender_focus: [], price_range: '', cover_image_url: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<StoreForm>(EMPTY)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetch('/api/dashboard/analytics')
      .then((r) => r.json())
      .then(({ data, code }) => {
        if (code === 'NO_STORE') return
        const slug = data?.store?.slug
        if (!slug) return
        setStoreSlug(slug)
        return fetch(`/api/stores/${slug}`)
          .then((r) => r.json())
          .then(({ data: s }) => {
            if (!s) return
            setForm({
              name: s.name ?? '',
              description: s.description ?? '',
              address: s.address ?? '',
              city: s.city ?? 'Santa Fe',
              phone_whatsapp: s.phone_whatsapp ?? '',
              email: s.email ?? '',
              website_url: s.website_url ?? '',
              style_tags: s.style_tags ?? [],
              gender_focus: s.gender_focus ?? [],
              price_range: s.price_range ?? '',
              cover_image_url: s.cover_image_url ?? '',
            })
          })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function uploadCover(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `covers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('stores').upload(path, file, { upsert: false })
    if (error) { setUploading(false); return }
    const { data } = supabase.storage.from('stores').getPublicUrl(path)
    setForm((f) => ({ ...f, cover_image_url: data.publicUrl }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const method = storeSlug ? 'PUT' : 'POST'
    const url = storeSlug ? `/api/stores/${storeSlug}` : '/api/stores'

    const body = {
      ...form,
      price_range: form.price_range || undefined,
      website_url: form.website_url || undefined,
      email: form.email || undefined,
      cover_image_url: form.cover_image_url || undefined,
      phone_whatsapp: form.phone_whatsapp || undefined,
      lat: -31.6333,
      lng: -60.7,
      legal_name: form.name,
      cuit: '00-00000000-0',
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      try {
        const { error: err } = await res.json()
        setError(err ?? 'Error al guardar')
      } catch {
        setError(`Error ${res.status}: intentá de nuevo`)
      }
      setSaving(false)
      return
    }

    const { data } = await res.json()
    if (!storeSlug && data?.slug) setStoreSlug(data.slug)
    setSuccess(true)
    setSaving(false)
  }

  function toggleArray(key: 'style_tags' | 'gender_focus', value: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold" style={{ fontSize: '22px', color: '#1D1D1F' }}>
        {storeSlug ? 'Configuración del local' : 'Crear tu local'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover image */}
        <div className="rounded-[16px] overflow-hidden p-5 space-y-3" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Foto de portada</p>
          {form.cover_image_url ? (
            <div className="relative w-full rounded-[12px] overflow-hidden" style={{ height: '140px' }}>
              <Image src={form.cover_image_url} alt="portada" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <X size={14} color="white" />
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center cursor-pointer"
              style={{ height: '100px', borderRadius: '12px', backgroundColor: '#F5F5F7', border: '2px dashed #D2D2D7' }}
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={24} style={{ color: '#AEAEB2' }} />
                  <span style={{ fontSize: '13px', color: '#AEAEB2' }}>Subir foto de portada</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
            </label>
          )}
        </div>

        {/* Info básica */}
        <div className="rounded-[16px] p-5 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Información del local</p>

          {[
            { key: 'name', label: 'Nombre del local *', placeholder: 'Ej: Style Store', required: true },
            { key: 'description', label: 'Descripción', placeholder: 'Contá de qué se trata tu local...' },
            { key: 'address', label: 'Dirección *', placeholder: 'Ej: San Martín 1234, Santa Fe', required: true },
            { key: 'city', label: 'Ciudad', placeholder: 'Santa Fe' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>{label}</p>
              <input
                type="text"
                value={form[key as keyof StoreForm] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 outline-none"
                style={{ height: '44px', borderRadius: '12px', backgroundColor: '#F5F5F7', fontSize: '15px', color: '#1D1D1F' }}
              />
            </div>
          ))}
        </div>

        {/* Contacto */}
        <div className="rounded-[16px] p-5 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Contacto</p>
          {[
            { key: 'phone_whatsapp', label: 'WhatsApp', placeholder: '+54 9 342 000 0000', type: 'tel' },
            { key: 'email', label: 'Email de contacto', placeholder: 'hola@tulocal.com', type: 'email' },
            { key: 'website_url', label: 'Link a tienda web', placeholder: 'https://tulocal.mitiendanube.com', type: 'url' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>{label}</p>
              <input
                type={type}
                value={form[key as keyof StoreForm] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 outline-none"
                style={{ height: '44px', borderRadius: '12px', backgroundColor: '#F5F5F7', fontSize: '15px', color: '#1D1D1F' }}
              />
            </div>
          ))}
        </div>

        {/* Identidad de estilo */}
        <div className="rounded-[16px] p-5 space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Identidad de estilo</p>

          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: '#1D1D1F' }}>Estilos que manejás</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggleArray('style_tags', s)}
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium capitalize"
                  style={{ backgroundColor: form.style_tags.includes(s) ? '#0071E3' : '#F5F5F7', color: form.style_tags.includes(s) ? '#FFFFFF' : '#1D1D1F' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: '#1D1D1F' }}>Géneros de ropa</p>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button key={g} type="button" onClick={() => toggleArray('gender_focus', g)}
                  className="flex-1 py-2 rounded-[10px] text-[13px] font-medium capitalize"
                  style={{ backgroundColor: form.gender_focus.includes(g) ? '#0071E3' : '#F5F5F7', color: form.gender_focus.includes(g) ? '#FFFFFF' : '#1D1D1F' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: '#1D1D1F' }}>Rango de precios</p>
            <div className="flex gap-2">
              {PRICE_OPTIONS.map((pr) => (
                <button key={pr} type="button"
                  onClick={() => setForm((f) => ({ ...f, price_range: f.price_range === pr ? '' : pr }))}
                  className="flex-1 py-2 rounded-[10px] text-[13px] font-medium capitalize"
                  style={{ backgroundColor: form.price_range === pr ? '#0071E3' : '#F5F5F7', color: form.price_range === pr ? '#FFFFFF' : '#1D1D1F' }}>
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p style={{ fontSize: '13px', color: '#FF3B30' }}>{error}</p>}
        {success && <p style={{ fontSize: '13px', color: '#34C759' }}>¡Guardado correctamente!</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full font-semibold disabled:opacity-50"
          style={{ height: '52px', borderRadius: '12px', backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '17px' }}
        >
          {saving ? 'Guardando...' : storeSlug ? 'Guardar cambios' : 'Crear local'}
        </button>
      </form>
    </div>
  )
}
