# YourCloset — Estado de Módulos
> Actualizado: 2026-06-20 | Agente: Backend/DB

---

## Setup inicial del proyecto

| Tarea | Estado | Agente | Notas |
|-------|--------|--------|-------|
| Next.js 14 + TypeScript + Tailwind + App Router | ✅ Completo | Backend/DB | v14.2.35, sin src/, alias @/* |
| shadcn/ui inicializado | ✅ Completo | Backend/DB | Tema por defecto, components.json creado |
| Dependencias instaladas | ✅ Completo | Backend/DB | Ver lista abajo |
| prisma/schema.prisma | ✅ Completo | Backend/DB | 11 modelos definidos |
| supabase/migrations/001_auth_trigger.sql | ✅ Completo | Backend/DB | Trigger handle_new_user |
| supabase/migrations/002_fts_index.sql | ✅ Completo | Backend/DB | Índice GIN para búsqueda full-text |
| .env.local configurado | ✅ Completo | Backend/DB | Falta DATABASE_URL con password real |

### Dependencias instaladas
- next@14.2.35, react@18, react-dom@18
- typescript@5, @types/node, @types/react
- tailwindcss@3.4, postcss
- eslint@8, eslint-config-next
- prisma, @prisma/client
- @supabase/supabase-js, @supabase/ssr
- zod
- framer-motion
- leaflet@1.9.4, react-leaflet@4.2.1
- leaflet.markercluster, @types/leaflet
- shadcn/ui (button, lib/utils)

---

## Módulos del MVP

| Módulo | Estado | Agente responsable | Prioridad |
|--------|--------|--------------------|-----------|
| **Auth — Sign In / Sign Up** | ⏳ Pendiente | Frontend | Alta |
| **Onboarding — Encuesta de estilo** | ⏳ Pendiente | Frontend + UI | Alta |
| **Home — Feed personalizado** | ⏳ Pendiente | Frontend | Alta |
| **Buscador con filtros** | ⏳ Pendiente | Frontend + Backend/DB | Alta |
| **Mapa interactivo (Leaflet)** | ⏳ Pendiente | Integraciones | Alta |
| **Perfil del local** | ⏳ Pendiente | Frontend | Media |
| **Panel de locales — Dashboard** | ⏳ Pendiente | Frontend | Media |
| **Panel de locales — Catálogo** | ⏳ Pendiente | Frontend + Backend/DB | Media |
| **Panel de locales — Analíticas** | ⏳ Pendiente | Frontend + Backend/DB | Media |
| **Sistema de valoraciones** | ⏳ Pendiente | Frontend + Backend/DB | Media |
| **Mi Perfil (usuario)** | ⏳ Pendiente | Frontend | Baja |

## API Routes

| Ruta | Estado | Agente |
|------|--------|--------|
| GET /api/stores | ⏳ Pendiente | Backend/DB |
| POST /api/stores | ⏳ Pendiente | Backend/DB |
| GET /api/stores/[slug] | ⏳ Pendiente | Backend/DB |
| PUT /api/stores/[slug] | ⏳ Pendiente | Backend/DB |
| GET /api/stores/[slug]/products | ⏳ Pendiente | Backend/DB |
| POST /api/stores/[slug]/products | ⏳ Pendiente | Backend/DB |
| DELETE /api/stores/[slug]/products/[id] | ⏳ Pendiente | Backend/DB |
| POST /api/stores/[slug]/ratings | ⏳ Pendiente | Backend/DB |
| GET /api/dashboard/analytics | ⏳ Pendiente | Backend/DB |
| POST /api/search/text | ⏳ Pendiente | Backend/DB |
| POST /api/user/style-profile | ⏳ Pendiente | Backend/DB |
| GET /api/user/feed | ⏳ Pendiente | Backend/DB |

## Pendiente de otros agentes (Backend/DB → resto)

- **Schema Prisma disponible** → Agente Frontend puede empezar a tipear los modelos
- **DATABASE_URL real** → El usuario debe completar la contraseña en `.env.local`
- **Migraciones SQL** → Ejecutar en Supabase Dashboard SQL Editor antes de correr la app
- **Supabase Storage buckets** → Crear manualmente en Supabase Dashboard: `products`, `stores`, `avatars`

## Fase 2 (fuera del MVP)

| Módulo | Estado |
|--------|--------|
| Búsqueda por imagen (GPT-4o Vision) | 🔮 Fase 2 |
| Outfits generados por IA | 🔮 Fase 2 |
| Búsqueda por voz | 🔮 Fase 2 |
| App móvil nativa | 🔮 Fase 2 |

---

*Este archivo se actualiza después de cada sesión de trabajo.*
