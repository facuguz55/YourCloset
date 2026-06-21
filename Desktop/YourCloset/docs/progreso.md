# YourCloset — Estado de Módulos
> Actualizado: 2026-06-20 | Sesión: fix Prisma + dark mode Apple style

---

## Setup inicial del proyecto ✅

| Tarea | Estado |
|-------|--------|
| Next.js 14 + TypeScript + Tailwind + App Router | ✅ |
| shadcn/ui inicializado | ✅ |
| Dependencias instaladas | ✅ |
| prisma/schema.prisma (11 modelos) | ✅ |
| prisma/schema.prisma engineType="library" (fix Prisma 7) | ✅ |
| prisma generate | ✅ |
| supabase/migrations/000_schema.sql | ✅ Ejecutado en Supabase |
| supabase/migrations/001_auth_trigger.sql | ✅ Ejecutado en Supabase |
| supabase/migrations/002_fts_index.sql | ✅ Ejecutado en Supabase |
| .env.local configurado | ✅ |
| TypeScript sin errores | ✅ |

---

## Backend / API Routes ✅

| Ruta | Método | Estado |
|------|--------|--------|
| /api/stores | GET, POST | ✅ |
| /api/stores/[slug] | GET, PUT | ✅ |
| /api/stores/[slug]/products | GET, POST | ✅ |
| /api/stores/[slug]/products/[id] | PUT, DELETE | ✅ |
| /api/stores/[slug]/ratings | POST | ✅ |
| /api/stores/[slug]/track | POST | ✅ |
| /api/dashboard/analytics | GET | ✅ |
| /api/search/text | POST | ✅ |
| /api/user/style-profile | GET, POST | ✅ |
| /api/user/feed | GET | ✅ |

## Lib / Infraestructura ✅

| Archivo | Estado |
|---------|--------|
| lib/prisma.ts (singleton) | ✅ |
| lib/supabase/server.ts | ✅ |
| lib/supabase/client.ts | ✅ |
| lib/types.ts | ✅ |
| lib/slug.ts | ✅ |
| lib/hooks/useDarkMode.ts | ✅ |
| middleware.ts (protección de rutas) | ✅ |

---

## Módulos del MVP — Frontend ✅

### Sistema de diseño

| Archivo | Estado |
|---------|--------|
| tailwind.config.ts (tokens YourCloset) | ✅ |
| app/globals.css (dark mode CSS vars + SF Pro + liquid glass) | ✅ |

### Componentes shared

| Componente | Archivo | Estado |
|-----------|---------|--------|
| BottomNav (Liquid Glass + dark mode real) | components/layout/BottomNav.tsx | ✅ |
| ProductCard (dark mode + glass) | components/search/ProductCard.tsx | ✅ |
| SearchBar | components/search/SearchBar.tsx | ✅ |
| SearchFilters | components/search/SearchFilters.tsx | ✅ |
| StoreBottomSheet (framer-motion) | components/map/StoreBottomSheet.tsx | ✅ |
| InteractiveMap (Leaflet + react-leaflet) | components/map/InteractiveMap.tsx | ✅ |

### Auth

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout Auth (blobs animados + liquid glass) | app/(auth)/layout.tsx | ✅ |
| Sign In (email + Google) | app/(auth)/sign-in/page.tsx | ✅ |
| Sign Up (email + Google + rol) | app/(auth)/sign-up/page.tsx | ✅ |
| OAuth Callback | app/auth/callback/route.ts | ✅ |

### App (usuario final)

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout App (gradiente radial + dark mode) | app/(app)/layout.tsx | ✅ |
| Onboarding (encuesta 3 pasos, no skippeable) | app/(app)/onboarding/page.tsx | ✅ |
| Home (feed masonry + infinite scroll + dark) | app/(app)/home/page.tsx | ✅ |
| Búsqueda (dark mode + cards dark) | app/(app)/search/page.tsx | ✅ |
| Perfil del local (público) | app/(app)/store/[slug]/page.tsx | ✅ |
| Mi perfil (dark mode completo + toggle) | app/(app)/profile/page.tsx | ✅ |
| Mapa | app/(app)/map/page.tsx | ✅ |

### Dashboard (locales)

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout Dashboard (nav active state ✅) | app/(dashboard)/layout.tsx | ✅ |
| Overview / métricas | app/(dashboard)/dashboard/page.tsx | ✅ |
| Gestión de catálogo + formulario | app/(dashboard)/dashboard/products/page.tsx | ✅ |
| Configuración del local | app/(dashboard)/dashboard/settings/page.tsx | ✅ |

---

## Pendientes / Próximos pasos

| Módulo | Estado | Notas |
|--------|--------|-------|
| Supabase Storage buckets (products, stores, avatars) | ⏳ | Crear en Supabase Dashboard |
| Sistema de valoraciones (formulario modal) | ⏳ | API route lista, falta UI |
| Store page dark mode | ⏳ | Pantalla pública del local |
| Map page dark mode | ⏳ | Mapa + bottom sheet |
| Deploy Vercel | ⏳ | Variables de entorno pendientes |

## Fase 2 (fuera del MVP)

| Módulo | Estado |
|--------|--------|
| POST /api/search/image (GPT-4o Vision) | 🔮 Fase 2 |
| POST /api/outfits/generate | 🔮 Fase 2 |

---

*Siguiente paso: configurar Supabase Storage buckets, agregar modal de valoraciones, y hacer deploy en Vercel con variables de entorno.*
