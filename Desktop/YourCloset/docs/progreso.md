# YourCloset — Estado de Módulos
> Actualizado: 2026-06-20 | Agente: Backend/DB

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

## Módulos del MVP — Frontend ⏳

| Módulo | Estado | Agente |
|--------|--------|--------|
| **Auth — Sign In / Sign Up** | ⏳ Pendiente | Frontend |
| **Onboarding — Encuesta de estilo** | ⏳ Pendiente | Frontend + UI |
| **Home — Feed personalizado** | ⏳ Pendiente | Frontend |
| **Buscador con filtros** | ⏳ Pendiente | Frontend |
| **Mapa interactivo (Leaflet)** | ⏳ Pendiente | Integraciones |
| **Perfil del local** | ⏳ Pendiente | Frontend |
| **Panel de locales — Dashboard** | ⏳ Pendiente | Frontend |
| **Panel de locales — Catálogo** | ⏳ Pendiente | Frontend |
| **Panel de locales — Analíticas** | ⏳ Pendiente | Frontend |
| **Sistema de valoraciones** | ⏳ Pendiente | Frontend |
| **Mi Perfil (usuario)** | ⏳ Pendiente | Frontend |

---

## Notas para el Agente Frontend

- Todos los endpoints retornan `{ data, meta? }` en éxito y `{ error, code }` en error
- Auth: usar `lib/supabase/client.ts` en Client Components, `lib/supabase/server.ts` en Server Components
- Tipos disponibles en `lib/types.ts`
- Feed: `GET /api/user/feed?cursor=&limit=20` — soporta infinite scroll con cursor
- Search: `POST /api/search/text` con body `{ query, category, style, gender, price_range, rating_min, order_by, limit }`
- Track events: `POST /api/stores/[slug]/track` con `{ event_type, product_id? }` — fire and forget
- Leaflet: importar siempre con `dynamic(() => import(...), { ssr: false })`

## Fase 2 (fuera del MVP)

| Módulo | Estado |
|--------|--------|
| POST /api/search/image (GPT-4o Vision) | 🔮 Fase 2 |
| POST /api/outfits/generate | 🔮 Fase 2 |

---

*Siguiente paso: Agente Frontend construye layout base, rutas y componentes shared.*
