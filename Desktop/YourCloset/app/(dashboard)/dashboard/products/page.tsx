'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Star, X } from 'lucide-react'
import { useStore } from '@/app/(dashboard)/store-context'
import type { Product } from '@/lib/types'

const CATEGORIES = ['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio'] as const
const STYLES = ['streetwear', 'casual', 'formal', 'sport', 'bohemio', 'minimalista']
const GENDERS = ['masculino', 'femenino', 'unisex'] as const
const PRICES = ['economico', 'medio', 'premium'] as const

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  price_range: '' as '' | 'economico' | 'medio' | 'premium',
  category: '' as '' | typeof CATEGORIES[number],
  gender: '' as '' | typeof GENDERS[number],
  style_tags: [] as string[],
  sizes_available: [] as string[],
  is_featured: false,
  image_url: '',
}
type FormState = typeof EMPTY_FORM

export default function ProductsPage() {
  const store = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // store=null mientras el contexto carga, store=undefined si no hay tienda
    if (store === undefined) return
    if (!store) { setLoading(false); return }
    fetch(`/api/stores/${store.slug}/products`)
      .then((r) => r.json())
      .then(({ data }) => setProducts(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [store])

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setError('La imagen no puede superar 8 MB.'); return }
    setUploading(true); setError(null)
    const fd = new FormData()
    fd.append('file', file); fd.append('bucket', 'products')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (!res.ok || !json.url) { setError(json.error ?? 'Error al subir'); return }
    setForm((f) => ({ ...f, image_url: json.url }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!store?.slug) return
    if (!form.image_url) { setError('Subí una imagen.'); return }
    if (!form.category) { setError('Elegí una categoría.'); return }
    if (!form.gender) { setError('Elegí un género.'); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/stores/${store.slug}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        price_range: form.price_range || undefined,
        category: form.category,
        gender: form.gender,
        style_tags: form.style_tags,
        sizes_available: form.sizes_available,
        image_urls: [form.image_url],
        is_featured: form.is_featured,
      }),
    })
    if (!res.ok) { const { error: err } = await res.json(); setError(err); setSaving(false); return }
    const { data: newProduct } = await res.json()
    setProducts((p) => [newProduct, ...p])
    setForm(EMPTY_FORM); setShowForm(false); setSaving(false)
  }

  async function handleDelete(productId: string) {
    if (!store?.slug || !confirm('Eliminar esta prenda?')) return
    await fetch(`/api/stores/${store.slug}/products/${productId}`, { method: 'DELETE' })
    setProducts((p) => p.filter((x) => x.id !== productId))
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
      <div className="flex items-center justify-between">
        <h2 className="font-bold" style={{ fontSize: '22px', color: '#1D1D1F' }}>Prendas ({products.length})</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 h-[40px] rounded-[10px] font-semibold" style={{ backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '15px' }}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
          <span style={{ fontSize: '40px' }}>👗</span>
          <p className="mt-3 font-medium" style={{ fontSize: '15px', color: '#6E6E73' }}>No cargaste ninguna prenda todavía.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 rounded-[10px] font-semibold" style={{ backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '15px' }}>
            Subir primera prenda
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex-none relative w-12 h-16 rounded-[8px] overflow-hidden" style={{ backgroundColor: '#F5F5F7' }}>
                {p.image_urls?.[0] ? <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span style={{ fontSize: '20px' }}>👗</span></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold truncate" style={{ fontSize: '15px', color: '#1D1D1F' }}>{p.name}</p>
                  {p.is_featured && <Star size={12} fill="#FF9500" style={{ color: '#FF9500', flexShrink: 0 }} />}
                </div>
                <p className="capitalize" style={{ fontSize: '13px', color: '#6E6E73' }}>{p.category}{p.price ? ` · ${p.price.toLocaleString('es-AR')}` : p.price_range ? ` · ${p.price_range}` : ''}</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="flex-none p-2 rounded-[8px]" style={{ backgroundColor: '#FEF2F2' }}>
                <Trash2 size={16} style={{ color: '#FF3B30' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full overflow-y-auto" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px 24px 0 0', maxHeight: '90vh', padding: '20px' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ fontSize: '20px', color: '#1D1D1F' }}>Nueva prenda</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(null) }}><X size={20} style={{ color: '#6E6E73' }} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: '#1D1D1F' }}>Foto *</p>
                {form.image_url ? (
                  <div className="relative rounded-[12px] overflow-hidden" style={{ width: '140px', aspectRatio: '3/4' }}>
                    <Image src={form.image_url} alt="preview" fill className="object-cover" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}><X size={12} color="white" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer" style={{ height: '120px', borderRadius: '12px', backgroundColor: '#F5F5F7', border: '2px dashed #D2D2D7' }}>
                    {uploading ? <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" /> : <><Plus size={24} style={{ color: '#AEAEB2' }} /><span className="mt-1" style={{ fontSize: '13px', color: '#AEAEB2' }}>Elegir foto</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Nombre *</p>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Campera bomber negra" required className="w-full px-4 outline-none" style={{ height: '44px', borderRadius: '12px', backgroundColor: '#F5F5F7', fontSize: '15px', color: '#1D1D1F' }} />
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Precio (opcional)</p>
                <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="25000" min={0} className="w-full px-4 outline-none" style={{ height: '44px', borderRadius: '12px', backgroundColor: '#F5F5F7', fontSize: '15px', color: '#1D1D1F' }} />
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Rango de precio</p>
                <div className="flex gap-2">
                  {PRICES.map((pr) => <button key={pr} type="button" onClick={() => setForm((f) => ({ ...f, price_range: f.price_range === pr ? '' : pr }))} className="flex-1 py-2 rounded-[10px] text-[13px] font-medium capitalize" style={{ backgroundColor: form.price_range === pr ? '#0071E3' : '#F5F5F7', color: form.price_range === pr ? '#FFFFFF' : '#1D1D1F' }}>{pr}</button>)}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Categoría *</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, category: f.category === c ? '' : c }))} className="px-3 py-1.5 rounded-full text-[13px] font-medium capitalize" style={{ backgroundColor: form.category === c ? '#0071E3' : '#F5F5F7', color: form.category === c ? '#FFFFFF' : '#1D1D1F' }}>{c}</button>)}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Género *</p>
                <div className="flex gap-2">
                  {GENDERS.map((g) => <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: f.gender === g ? '' : g }))} className="flex-1 py-2 rounded-[10px] text-[13px] font-medium capitalize" style={{ backgroundColor: form.gender === g ? '#0071E3' : '#F5F5F7', color: form.gender === g ? '#FFFFFF' : '#1D1D1F' }}>{g}</button>)}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Estilo</p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, style_tags: f.style_tags.includes(s) ? f.style_tags.filter((x) => x !== s) : [...f.style_tags, s] }))} className="px-3 py-1.5 rounded-full text-[13px] font-medium capitalize" style={{ backgroundColor: form.style_tags.includes(s) ? '#0071E3' : '#F5F5F7', color: form.style_tags.includes(s) ? '#FFFFFF' : '#1D1D1F' }}>{s}</button>)}
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <div><p className="font-medium" style={{ fontSize: '15px', color: '#1D1D1F' }}>Destacar prenda</p><p style={{ fontSize: '13px', color: '#6E6E73' }}>Aparece primero (máx. 6)</p></div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))} className="relative w-12 h-7 rounded-full transition-colors" style={{ backgroundColor: form.is_featured ? '#0071E3' : '#D2D2D7' }}>
                  <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform" style={{ transform: form.is_featured ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
              {error && <p style={{ fontSize: '13px', color: '#FF3B30' }}>{error}</p>}
              <button type="submit" disabled={saving || uploading} className="w-full font-semibold disabled:opacity-50" style={{ height: '48px', borderRadius: '12px', backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '15px' }}>
                {saving ? 'Guardando...' : 'Guardar prenda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}