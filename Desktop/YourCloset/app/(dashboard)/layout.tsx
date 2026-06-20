import Link from 'next/link'
import { LayoutDashboard, Package, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Resumen' },
  { href: '/dashboard/products', icon: Package, label: 'Prendas' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5"
        style={{
          height: '56px',
          backgroundColor: '#FFFFFF',
          borderBottom: '0.5px solid #D2D2D7',
        }}
      >
        <span className="font-bold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Panel del local</span>
        <Link href="/home" style={{ fontSize: '15px', color: '#0071E3', fontWeight: 600 }}>
          Ver app
        </Link>
      </header>

      {/* Tab nav */}
      <nav className="flex items-center px-4 gap-1 py-2" style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #F5F5F7' }}>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] transition-colors"
            style={{ fontSize: '13px', fontWeight: 500, color: '#6E6E73' }}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <main className="p-4 max-w-3xl mx-auto">
        {children}
      </main>
    </div>
  )
}
