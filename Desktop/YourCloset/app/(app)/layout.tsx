import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#FFFFFF', paddingBottom: '96px' }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
