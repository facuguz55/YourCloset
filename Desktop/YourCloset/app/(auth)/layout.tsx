export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F5F5F7' }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
