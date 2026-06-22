import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { verifyAdminRole } from '@/lib/auth-helpers'

export async function GET() {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    { count: totalUsers },
    { count: totalStores },
    { count: totalProducts },
    { count: swipesToday },
    { count: newUsersWeek },
    { data: styleStats },
    { data: storesNoCatalog },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('stores').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('store_analytics').select('*', { count: 'exact', head: true })
      .in('event_type', ['swipe_right', 'swipe_left'])
      .gte('created_at', today.toISOString()),
    admin.from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString()),
    admin.from('users').select('style_profile'),
    admin.from('stores')
      .select('id, name, owner_id')
      .eq('is_active', true)
      .not('owner_id', 'is', null),
  ])

  // Calcular distribución de estilos
  const styleCounts: Record<string, number> = {}
  if (styleStats) {
    for (const u of styleStats) {
      const estilos = u.style_profile?.estilos ?? []
      for (const estilo of estilos) {
        styleCounts[estilo] = (styleCounts[estilo] ?? 0) + 1
      }
    }
  }

  // Locales sin catálogo
  let storesWithNoCatalog: { id: string; name: string }[] = []
  if (storesNoCatalog) {
    const storeIds = storesNoCatalog.map((s) => s.id)
    const { data: productsData } = await admin
      .from('products')
      .select('store_id', { count: 'exact' })
      .in('store_id', storeIds)
      .eq('is_active', true)

    const storesWithProducts = new Set(productsData?.map((p) => p.store_id) ?? [])
    storesWithNoCatalog = storesNoCatalog
      .filter((s) => !storesWithProducts.has(s.id))
      .slice(0, 10)
  }

  return NextResponse.json({
    data: {
      totalUsers: totalUsers ?? 0,
      totalStores: totalStores ?? 0,
      totalProducts: totalProducts ?? 0,
      swipesToday: swipesToday ?? 0,
      newUsersWeek: newUsersWeek ?? 0,
      styleDistribution: styleCounts,
      storesNoCatalog: storesWithNoCatalog,
    },
  })
}
