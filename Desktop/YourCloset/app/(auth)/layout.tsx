'use client'

import { motion } from 'framer-motion'

const BLOBS = [
  {
    color: 'radial-gradient(ellipse at center, rgba(196,218,255,0.70) 0%, transparent 70%)',
    size: 600,
    animate: { x: ['-80px', '60px', '-40px', '-80px'], y: ['-120px', '40px', '-60px', '-120px'] },
    duration: 14,
  },
  {
    color: 'radial-gradient(ellipse at center, rgba(220,204,255,0.55) 0%, transparent 70%)',
    size: 500,
    animate: { x: ['200px', '80px', '260px', '200px'], y: ['80px', '-60px', '140px', '80px'] },
    duration: 18,
  },
  {
    color: 'radial-gradient(ellipse at center, rgba(255,218,196,0.55) 0%, transparent 70%)',
    size: 450,
    animate: { x: ['60px', '-80px', '120px', '60px'], y: ['260px', '180px', '300px', '260px'] },
    duration: 16,
  },
  {
    color: 'radial-gradient(ellipse at center, rgba(196,242,214,0.50) 0%, transparent 70%)',
    size: 380,
    animate: { x: ['-120px', '40px', '-60px', '-120px'], y: ['180px', '280px', '100px', '180px'] },
    duration: 20,
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Animated background blobs */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            filter: 'blur(72px)',
            borderRadius: '50%',
            left: '50%',
            top: '50%',
            marginLeft: -blob.size / 2,
            marginTop: -blob.size / 2,
          }}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Glass card */}
      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.60) 100%)',
          backdropFilter: 'blur(48px) saturate(200%) brightness(1.08)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.08)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow:
            '0 2px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.4) inset, 0 24px 64px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '36px 28px 32px',
        }}
      >
        {/* Specular highlight top edge */}
        <div
          className="absolute top-0 left-6 right-6 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,1) 70%, transparent 100%)',
            borderRadius: '1px',
          }}
        />

        {children}
      </motion.div>
    </div>
  )
}
