'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface Props {
  imageSrc: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas toBlob falló'))
    }, 'image/jpeg', 0.92)
  })
}

export default function CoverCropper({ imageSrc, onCrop, onCancel }: Props) {
  const { dark } = useDarkMode()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const surface = dark ? '#2C2C2E' : '#F5F5F7'
  const accentColor = dark ? '#0A84FF' : '#0071E3'

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      onCrop(blob)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: '#000000' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{
            height: '52px',
            background: dark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <button
            onClick={onCancel}
            className="flex items-center gap-1 active:opacity-60 transition-opacity"
            style={{ color: accentColor, fontSize: '15px', fontWeight: 600 }}
          >
            <X size={18} />
            Cancelar
          </button>
          <p className="font-semibold" style={{ fontSize: '16px', color: textPrimary }}>
            Recortar portada
          </p>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex items-center gap-1 active:opacity-60 transition-opacity disabled:opacity-40"
            style={{ color: accentColor, fontSize: '15px', fontWeight: 600 }}
          >
            {processing ? (
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
            ) : (
              <Check size={18} />
            )}
            Listo
          </button>
        </div>

        {/* Crop area — ocupa todo el espacio disponible */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            style={{
              containerStyle: { width: '100%', height: '100%' },
              cropAreaStyle: {
                border: '2px solid rgba(255,255,255,0.9)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              },
            }}
          />
        </div>

        {/* Controles de zoom */}
        <div
          className="flex-shrink-0 flex items-center gap-4 px-6"
          style={{
            height: '88px',
            background: dark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: surface }}
          >
            <ZoomOut size={17} style={{ color: textPrimary }} />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-500"
            style={{ accentColor }}
          />

          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ backgroundColor: surface }}
          >
            <ZoomIn size={17} style={{ color: textPrimary }} />
          </button>
        </div>

        {/* Hint */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            height: '36px',
            background: dark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
          }}
        >
          <p style={{ fontSize: '12px', color: textSecondary }}>
            Mové y hacé zoom para ajustar el recorte
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
