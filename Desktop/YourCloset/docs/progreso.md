# YourCloset — Estado de Módulos
> Actualizado: 2026-06-20 | Agente: Frontend

---

## Setup inicial del proyecto ✅

| Tarea | Estado |
|-------|--------|
| Next.js 14 + TypeScript + Tailwind + App Router | ✅ |
| shadcn/ui inicializado | ✅ |
| Dependencias instaladas | ✅ |
| prisma/schema.prisma (11 modelos) | ✅ |
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
| middleware.ts (protección de rutas) | ✅ |

---

## Módulos del MVP — Frontend ✅

### Sistema de diseño

| Archivo | Estado |
|---------|--------|
| tailwind.config.ts (tokens YourCloset) | ✅ |
| app/globals.css (variables --color-*) | ✅ |

### Componentes shared

| Componente | Archivo | Estado |
|-----------|---------|--------|
| BottomNav (Liquid Glass) | components/layout/BottomNav.tsx | ✅ |
| ProductCard (aspect 3:4, skeleton) | components/search/ProductCard.tsx | ✅ |
| SearchBar | components/search/SearchBar.tsx | ✅ |
| SearchFilters | components/search/SearchFilters.tsx | ✅ |
| StoreBottomSheet (framer-motion) | components/map/StoreBottomSheet.tsx | ✅ |
| InteractiveMap (Leaflet + react-leaflet) | components/map/InteractiveMap.tsx | ✅ |

### Auth

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout Auth (centrado) | app/(auth)/layout.tsx | ✅ |
| Sign In (email + Google) | app/(auth)/sign-in/page.tsx | ✅ |
| Sign Up (email + Google + rol) | app/(auth)/sign-up/page.tsx | ✅ |
| OAuth Callback | app/auth/callback/route.ts | ✅ |

### App (usuario final)

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout App (con BottomNav) | app/(app)/layout.tsx | ✅ |
| Onboarding (encuesta 3 pasos, no skippeable) | app/(app)/onboarding/page.tsx | ✅ |
| Home (feed masonry + infinite scroll) | app/(app)/home/page.tsx | ✅ |
| Búsqueda (SearchBar + Filters + resultados) | app/(app)/search/page.tsx | ✅ |
| Perfil del local (público) | app/(app)/store/[slug]/page.tsx | ✅ |
| Mi perfil | app/(app)/profile/page.tsx | ✅ |
| Mapa | app/(app)/map/page.tsx | ✅ |

### Dashboard (locales)

| Pantalla | Ruta | Estado |
|---------|------|--------|
| Layout Dashboard (sidebar + header) | app/(dashboard)/layout.tsx | ✅ |
| Overview / métricas | app/(dashboard)/dashboard/page.tsx | ✅ |
| Gestión de catálogo + formulario | app/(dashboard)/dashboard/products/page.tsx | ✅ |
| Configuración del local | app/(dashboard)/dashboard/settings/page.tsx | ✅ |

---

## Pendientes / Próximos pasos

| Módulo | Estado | Agente |
|--------|--------|--------|
| Leaflet CSS fix (importación en app global) | ⏳ | Frontend |
| NEXT_PUBLIC_APP_URL en .env.local | ⏳ | Config |
| Supabase Storage buckets (products, stores, avatars) | ⏳ | Integraciones |
| Sistema de valoraciones (formulario modal) | ⏳ | Frontend |
| Dashboard nav active state (usePathname) | ⏳ | Frontend |

## Fase 2 (fuera del MVP)

| Módulo | Estado |
|--------|--------|
| POST /api/search/image (GPT-4o Vision) | 🔮 Fase 2 |
| POST /api/outfits/generate | 🔮 Fase 2 |

---

*Siguiente paso: Agente Integraciones configura Supabase Storage buckets y revisa la configuración de Leaflet. Luego, configurar variables de entorno en Vercel y hacer deploy.*
