'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MessageCircle, Mail, Globe, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { StoreWithRating } from '@/lib/types'
import { safeUrl } from '@/lib/safe-url'

interface Props {
  store: StoreWithRating | null
  onClose: () => void
  onTrack: (eventType: string) => void
}

export default function StoreBottomSheet({ store, onClose, onTrack }: Props) {
  return (
    <AnimatePresence>
      {store && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white overflow-hidden"
            style={{
              borderRadius: '24px 24px 0 0',
              maxHeight: '75vh',
              boxShadow: '0 -2px 32px rgba(0,0,0,0.16)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: '75vh' }}>
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#D2D2D7' }} />
              </div>

              {/* Cover image */}
              {store.cover_image_url && (
                <div className="relative w-full" style={{ height: '160px' }}>
                  <Image
                    src={store.cover_image_url}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[20px] font-bold truncate" style={{ color: '#1D1D1F' }}>
                      {store.name}
                    </h2>
                    <p className="text-[13px] mt-0.5" style={{ color: '#6E6E73' }}>
                      {store.address}, {store.city}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex-none flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ backgroundColor: '#F5F5F7' }}
                  >
                    <X size={16} style={{ color: '#6E6E73' }} />
                  </button>
                </div>

                {/* Rating */}
                {store._avg_rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i <= Math.round(store._avg_rating!) ? '#FF9500' : 'none'}
                          style={{ color: '#FF9500' }}
                        />
                      ))}
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: '#1D1D1F' }}>
                      {store._avg_rating!.toFixed(1)}
                    </span>
                    {store._rating_count !== undefined && (
                      <span className="text-[13px]" style={{ color: '#6E6E73' }}>
                        ({store._rating_count} valoraciones)
                      </span>
                    )}
                  </div>
                )}

                {/* Style tags */}
                {store.style_tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {store.style_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium capitalize"
                        style={{ backgroundColor: '#F5F5F7', color: '#6E6E73' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {store.phone_whatsapp && (
                    <a
                      href={`https://wa.me/${store.phone_whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrack('whatsapp_click')}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] transition-colors active:scale-95"
                      style={{ backgroundColor: '#25D366', minHeight: '44px' }}
                    >
                      <MessageCircle size={18} color="#FFFFFF" />
                      <span className="text-[11px] font-semibold text-white">WhatsApp</span>
                    </a>
                  )}
                  {store.email && (
                    <a
                      href={`mailto:${store.email}`}
                      onClick={() => onTrack('email_click')}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] transition-colors active:scale-95"
                      style={{ backgroundColor: '#F5F5F7', minHeight: '44px' }}
                    >
                      <Mail size={18} style={{ color: '#1D1D1F' }} />
                      <span className="text-[11px] font-semibold" style={{ color: '#1D1D1F' }}>Email</span>
                    </a>
                  )}
                  {store.website_url && (
                    <a
                      href={safeUrl(store.website_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrack('website_click')}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] transition-colors active:scale-95"
                      style={{ backgroundColor: '#F5F5F7', minHeight: '44px' }}
                    >
                      <Globe size={18} style={{ color: '#1D1D1F' }} />
                      <span className="text-[11px] font-semibold" style={{ color: '#1D1D1F' }}>Tienda</span>
                    </a>
                  )}
                </div>

                {/* Ver perfil completo */}
                <Link
                  href={`/store/${store.slug}`}
                  className="flex items-center justify-between w-full py-3.5 px-4 rounded-[12px] transition-colors active:scale-[0.99]"
                  style={{ backgroundColor: '#0071E3' }}
                >
                  <span className="text-[15px] font-semibold text-white">Ver perfil completo</span>
                  <ChevronRight size={18} color="#FFFFFF" />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
