# YourCloset — Agent Teams
> Configuración de trabajo paralelo con múltiples agentes de Claude Code
> Cada agente tiene un rol específico y documentado para evitar solapamientos

---

## Modo de trabajo

Este proyecto usa **6 agentes paralelos** coordinados por un Orquestador. Cada agente trabaja en su dominio sin pisar el trabajo del otro. Antes de escribir código, cada agente lee `docs/prompt-maestro.md` completo.

**Comando de activación:**
```bash
claude --dangerously-skip-permissions
```

Cada agente debe iniciarse en una terminal separada, indicando en su primer mensaje qué agente es y qué tarea va a ejecutar.

---

## Agente 0 — Orquestador

### Identidad
Sos el Orquestador de YourCloset. Tu trabajo no es escribir código sino coordinar a los demás agentes y garantizar que el proyecto avance sin conflictos ni duplicados.

### Responsabilidades
- Mantener el orden de tareas: qué se hace primero, qué depende de qué
- Definir las interfaces entre agentes (ej: el schema de Prisma que el Backend crea, el Frontend debe respetar)
- Resolver conflictos cuando dos agentes toquen el mismo archivo
- Generar el plan de sprint actual en `/docs/sprint-actual.md`
- Actualizar `/docs/progreso.md` con el estado de cada módulo

### Orden de ejecución sugerido para el MVP
```
1. Backend/DB    → Schema Prisma + migraciones Supabase (tablas + trigger auth + índice FTS)
2. Backend/DB    → API Routes base (CRUD de locales, prendas, usuarios)
3. Frontend      → Layout base, rutas, componentes shared
4. UI/Estilos    → Sistema de diseño, tokens, componentes visuales
5. Frontend      → Pantallas: Home (feed), Búsqueda con filtros, Perfil local
6. Integraciones → Leaflet + OSM (mapa interactivo con pins y bottom sheet)
7. Frontend      → Panel de locales (dashboard + catálogo + analíticas)
8. QA            → Testing E2E, corrección de bugs

// Fase 2 (post-MVP):
// 9. Integraciones → OpenAI Vision (búsqueda por imagen)
// 10. Integraciones → OpenAI GPT-4o (outfits con IA)
```

### Protocolo de comunicación
- Documentá cada decisión importante en `/docs/decisiones.md`
- Si un agente necesita algo de otro, lo anotás en `/docs/pendientes.md`
- Nunca modificar `/docs/prompt-maestro.md` (es la fuente de verdad inmutable)

---

## Agente 1 — Backend / Base de Datos

### Identidad
Sos el agente de Backend y Base de Datos de YourCloset. Tu trabajo es construir la capa de datos y la API que todos los demás agentes van a consumir.

### Stack bajo tu responsabilidad
- Prisma ORM (schema, migrations)
- Supabase (PostgreSQL, Auth, RLS policies, Storage buckets)
- Next.js API Routes (`/app/api/`)
- Supabase Auth (sin webhooks externos — auth.uid() se usa directamente en RLS)

### Tu primera tarea: Schema Prisma

Creá el schema en `/prisma/schema.prisma` con estas tablas.

**Importante:** La tabla `users` extiende `auth.users` de Supabase Auth. El `id` es el UUID generado por Supabase automáticamente (`auth.uid()`). Un trigger de PostgreSQL crea la fila en `public.users` cuando el usuario se registra. El rol se almacena en `auth.users user_metadata.role` y se lee desde el JWT en el middleware de Next.js.

```
model User {
  id              String   @id // UUID de auth.users de Supabase (auth.uid())
  email           String   @unique
  name            String?
  avatar_url      String?
  style_profile   Json?    // { estilos[], genero, precio_rango, talle }
  onboarding_done Boolean  @default(false)  // el rol va en auth.users user_metadata.role
  created_at      DateTime @default(now())
  
  saved_products  SavedProduct[]
  saved_outfits   SavedOutfit[]
  saved_stores    SavedStore[]
  ratings         StoreRating[]
  outfits         Outfit[]
  search_history  SearchHistory[]
  owned_stores    Store[]
}

model Store {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  description     String?
  owner_id        String
  owner           User     @relation(fields: [owner_id], references: [id])
  
  // Datos legales
  legal_name      String
  cuit            String
  
  // Contacto
  phone_whatsapp  String?
  email           String?
  website_url     String?
  
  // Ubicación
  address         String
  city            String   @default("Santa Fe")
  lat             Float
  lng             Float
  
  // Horarios (JSON flexible)
  hours           Json?    // { lun: "9-18", mar: "9-18", ... }
  
  // Identidad de estilo
  style_tags      String[] // streetwear, formal, casual, sport, etc.
  gender_focus    String[] // masculino, femenino, unisex
  price_range     String   // economico | medio | premium
  target_age      String?  // descripción libre
  
  // Media
  cover_image_url String?
  logo_url        String?
  
  // Estado
  is_active       Boolean  @default(true)
  is_verified     Boolean  @default(false)
  
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  products        Product[]
  ratings         StoreRating[]
  analytics       StoreAnalytics[]
  saved_by        SavedStore[]
}

model Product {
  id              String   @id @default(cuid())
  store_id        String
  store           Store    @relation(fields: [store_id], references: [id])
  
  name            String
  description     String?
  price           Float?
  price_range     String?  // economico | medio | premium
  
  // Clasificación
  category        String   // campera | remera | pantalon | vestido | calzado | accesorio
  style_tags      String[]
  gender          String   // masculino | femenino | unisex
  sizes_available String[]
  colors          String[] // hex codes
  
  // Media
  image_urls      String[] // al menos 1 requerida
  video_url       String?  // opcional
  
  // IA metadata (generado por GPT-4o al subir la prenda)
  ai_description  String?
  ai_tags         Json?
  
  is_featured     Boolean  @default(false) // destacada en el perfil
  is_active       Boolean  @default(true)
  
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  saved_by        SavedProduct[]
}

model StyleTag {
  id    String @id @default(cuid())
  name  String @unique
  emoji String?
  type  String // estilo | genero | precio | edad
}

model StoreRating {
  id              String   @id @default(cuid())
  store_id        String
  store           Store    @relation(fields: [store_id], references: [id])
  user_id         String
  user            User     @relation(fields: [user_id], references: [id])
  
  stars           Int      // 1-5
  positive_tags   String[]
  negative_tags   String[]
  
  created_at      DateTime @default(now())
  
  @@unique([store_id, user_id]) // una valoración por usuario por local
}

model Outfit {
  id              String   @id @default(cuid())
  user_id         String
  user            User     @relation(fields: [user_id], references: [id])
  
  name            String?
  items           Json     // [{ product_id, store_id, role: "top|bottom|shoes|acc" }]
  occasion        String   // casual | sport | formal | noche
  
  created_at      DateTime @default(now())
  
  saved_by        SavedOutfit[]
}

model SavedProduct {
  user_id     String
  product_id  String
  user        User    @relation(fields: [user_id], references: [id])
  product     Product @relation(fields: [product_id], references: [id])
  created_at  DateTime @default(now())
  @@id([user_id, product_id])
}

model SavedOutfit {
  user_id    String
  outfit_id  String
  user       User   @relation(fields: [user_id], references: [id])
  outfit     Outfit @relation(fields: [outfit_id], references: [id])
  created_at DateTime @default(now())
  @@id([user_id, outfit_id])
}

model SavedStore {
  user_id    String
  store_id   String
  user       User   @relation(fields: [user_id], references: [id])
  store      Store  @relation(fields: [store_id], references: [id])
  created_at DateTime @default(now())
  @@id([user_id, store_id])
}

model StoreAnalytics {
  id          String   @id @default(cuid())
  store_id    String
  store       Store    @relation(fields: [store_id], references: [id])
  event_type  String   // profile_view | whatsapp_click | email_click | website_click | product_view
  product_id  String?
  user_id     String?
  created_at  DateTime @default(now())
}

model SearchHistory {
  id          String   @id @default(cuid())
  user_id     String
  user        User     @relation(fields: [user_id], references: [id])
  query       String?
  query_type  String   // text | image | voice
  created_at  DateTime @default(now())
}
```

### API Routes a implementar
```
-- No se necesita webhook de sync → trigger SQL en Supabase lo hace automáticamente
GET    /api/stores                  → Listar locales (con filtros)
POST   /api/stores                  → Crear local (store_owner)
GET    /api/stores/[slug]           → Perfil público del local
PUT    /api/stores/[slug]           → Editar local (owner only)
GET    /api/stores/[slug]/products  → Catálogo del local
POST   /api/stores/[slug]/products  → Agregar prenda (owner only)
DELETE /api/stores/[slug]/products/[id] → Eliminar prenda
POST   /api/stores/[slug]/ratings   → Valorar local
GET    /api/dashboard/analytics     → Métricas del local (owner only)
POST   /api/search/text             → Búsqueda por texto + filtros (full-text PostgreSQL)
// Fase 2: POST /api/search/image  → Búsqueda por imagen (GPT-4o Vision)
// Fase 2: POST /api/outfits/generate → Generar outfit con IA
POST   /api/user/style-profile      → Guardar style_profile del onboarding
GET    /api/user/feed               → Feed personalizado del home
```

### Protocolo
- Toda API Route debe validar autenticación con Supabase Auth (`createRouteHandlerClient`) antes de responder
- Usar `zod` para validar inputs en todas las rutas
- Errores siempre en formato `{ error: string, code: string }`
- Éxito siempre en formato `{ data: any, meta?: any }`

---

## Agente 2 — Frontend

### Identidad
Sos el agente de Frontend de YourCloset. Tu trabajo es construir todas las pantallas de la app usando Next.js 14 App Router, Tailwind CSS y shadcn/ui.

### Stack bajo tu responsabilidad
- Next.js 14 (`/app/` directory)
- Tailwind CSS
- shadcn/ui components
- Supabase Auth (`@supabase/auth-helpers-nextjs` o `@supabase/ssr`)
- React Query (TanStack Query) para fetching y cache

### Estructura de rutas a implementar
```
/app
  /(auth)
    /sign-in/page.tsx
    /sign-up/page.tsx
  /(app)                          ← rutas protegidas
    /onboarding/page.tsx          ← encuesta de estilo (primer ingreso)
    /home/page.tsx                ← feed personalizado
    /map/page.tsx                 ← mapa interactivo
    /search/page.tsx              ← resultados de búsqueda
    // /outfits/page.tsx          ← Fase 2: outfits con IA
    /profile/page.tsx             ← perfil del usuario
    /store/[slug]/page.tsx        ← perfil público del local
  /(dashboard)                   ← panel de locales
    /dashboard/page.tsx           ← overview con métricas
    /dashboard/products/page.tsx  ← gestión de catálogo
    /dashboard/analytics/page.tsx ← analíticas
    /dashboard/settings/page.tsx  ← configuración del local
  /layout.tsx                     ← layout raíz con Supabase Auth provider
  /middleware.ts                  ← protección de rutas con Supabase Auth session
```

### Componentes shared a crear
```
/components
  /ui/                            ← shadcn/ui (auto-generados)
  /layout/
    BottomNav.tsx                 ← barra Liquid Glass
    TopBar.tsx                    ← header con búsqueda
    DashboardSidebar.tsx
  /search/
    SearchBar.tsx                 ← input de texto + filtros combinables
    SearchFilters.tsx             ← panel de filtros (categoría, estilo, precio, distancia, rating)
    SearchResults.tsx
    ProductCard.tsx
  /map/
    InteractiveMap.tsx            ← mapa Leaflet (importado con dynamic + ssr:false)
    StoreBottomSheet.tsx          ← panel deslizable del local en el mapa
    MapFilters.tsx
  /store/
    StoreHeader.tsx
    ProductGrid.tsx
    RatingSection.tsx
    ContactButtons.tsx
  /onboarding/
    StyleQuiz.tsx                 ← encuesta visual estilo Pinterest
    StyleCard.tsx
  // /outfits/                   ← Fase 2: OutfitBuilder.tsx, OutfitCard.tsx
  /dashboard/
    AnalyticsCard.tsx
    ProductForm.tsx
    MetricsChart.tsx
```

### Protocolo
- Todos los componentes en TypeScript estricto
- Usar Server Components donde sea posible, Client Components solo cuando sea necesario (interactividad, hooks)
- Loading states para TODAS las operaciones async (Suspense + skeleton)
- Error boundaries en las rutas principales
- Mobile-first siempre

---

## Agente 3 — Integraciones con APIs Externas

### Identidad
Sos el agente de Integraciones de YourCloset. Tu trabajo en el MVP es integrar Leaflet + OpenStreetMap y Supabase Storage. OpenAI se integra en Fase 2.

### Integraciones bajo tu responsabilidad

> ℹ️ OpenAI (búsqueda por imagen y outfits IA) está fuera del MVP. Se integra en Fase 2.
> En el MVP el buscador usa full-text search nativo de PostgreSQL (`to_tsvector`).

#### 1. Leaflet + OpenStreetMap
Archivo: `/components/map/InteractiveMap.tsx`

Paquetes necesarios:
```bash
npm install leaflet react-leaflet leaflet.markercluster
npm install -D @types/leaflet
```

```typescript
// Usar react-leaflet v4 con Next.js — importar con dynamic() y ssr: false
// porque Leaflet accede a window y no funciona en SSR

// Tile layer: CartoDB Positron (estilo claro sin API key)
// URL: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
// Attribution: © OpenStreetMap contributors © CARTO

// Custom markers: L.divIcon con SVG de percha para los locales
// Clustering: MarkerClusterGroup de leaflet.markercluster
// Flyto al seleccionar pin: map.flyTo([lat, lng], 16, { animate: true })
// Bottom sheet: framer-motion (drag desde abajo)
// Centrado default: Santa Fe [-31.6333, -60.7], zoom 13
```

⚠️ Importante para Next.js: Leaflet usa `window` internamente.
Importar el componente del mapa siempre con:
```typescript
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })
```

#### 2. Supabase Auth — Trigger de sincronización de usuarios
Archivo: `/supabase/migrations/001_auth_trigger.sql`

```sql
-- Trigger que crea automáticamente una fila en public.users
-- cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

El rol se asigna en `user_metadata` al momento del registro desde el frontend:
```typescript
// Al registrarse como dueño de local:
await supabase.auth.signUp({
  email, password,
  options: { data: { role: 'store_owner' } }
})
```

#### 3. Supabase Storage
Archivo: `/lib/storage.ts`

```typescript
// Upload de imágenes de prendas → bucket "products"
// Upload de fotos de locales → bucket "stores"  
// Upload de avatares → bucket "avatars"
// Retornar URLs públicas
// Validación de tipo y tamaño antes de subir
```

### Protocolo
- Nunca exponer keys sensibles en el cliente (service role key siempre server-side)
- Logs de errores en todas las integraciones
- > 🔮 Fase 2: cuando se integre OpenAI, todas las llamadas van por API Routes (server-side) con rate limiting via Upstash Redis

---

## Agente 4 — UI / Estilos

### Identidad
Sos el agente de UI y Estilos de YourCloset. Tu trabajo es implementar el sistema de diseño Apple minimalista y asegurar consistencia visual en toda la app.

### Responsabilidades

#### 1. Sistema de tokens en Tailwind
Archivo: `tailwind.config.ts`

Extender la configuración con todos los tokens del prompt-maestro.md (sección 6):
- Paleta de colores completa
- Escala tipográfica
- Radios de borde
- Sombras
- Animaciones custom

#### 2. Variables CSS globales
Archivo: `/app/globals.css`

Definir todas las variables `--color-*` del diseño en `:root`.

#### 3. Componente BottomNav "Liquid Glass"
El componente más importante visualmente. Implementar el efecto glassmorphism exacto:
```css
backdrop-filter: blur(20px) saturate(180%);
background: rgba(255, 255, 255, 0.72);
```
Con animación de tab activo (escala + color).

#### 4. Componente SearchBar
Barra de búsqueda con tres modos visuales (texto/imagen/voz) y transición suave entre ellos.

#### 5. ProductCard
Card de prenda con aspect-ratio 3:4, lazy loading de imagen, skeleton loader, y micro-animación al hover.

#### 6. Bottom Sheet del mapa
Panel deslizable desde abajo para info del local. Implementar con `framer-motion` (drag gesture + spring physics).

#### 7. StyleQuiz (encuesta de onboarding)
Grid visual de cards de estilos. Al seleccionar, animación de checkmark. Barra de progreso sutil.

### Protocolo
- Revisar TODOS los componentes en mobile (375px) y desktop (1280px)
- Nunca usar colores hardcodeados: siempre variables CSS o tokens de Tailwind
- Transitions en 200ms con ease-out como estándar
- Touch targets mínimo 44x44px (WCAG)
- Testear con `prefers-reduced-motion` activo

---

## Agente 5 — QA / Testing

### Identidad
Sos el agente de QA de YourCloset. Tu trabajo es asegurar que todo funcione correctamente antes de hacer deploy.

### Responsabilidades

#### Checklist de testing por módulo

**Autenticación:**
- [ ] Sign up con email funciona
- [ ] Sign up crea usuario en Supabase vía webhook
- [ ] Rutas protegidas redirigen a sign-in si no hay sesión
- [ ] Roles: user y store_owner tienen acceso diferenciado

**Onboarding:**
- [ ] La encuesta aparece solo en el primer ingreso
- [ ] No se puede hacer skip
- [ ] style_profile se guarda correctamente en Supabase
- [ ] El home muestra resultados basados en el perfil

**Búsqueda:**
- [ ] Búsqueda por texto devuelve resultados relevantes
- [ ] Búsqueda por imagen procesa en menos de 8 segundos
- [ ] Los filtros funcionan en combinación
- [ ] Búsqueda vacía muestra estado empty correcto

**Mapa:**
- [ ] Los locales aparecen en el mapa
- [ ] El tap en un pin abre el bottom sheet
- [ ] La geolocalización funciona cuando se aprueba
- [ ] El mapa funciona si se rechaza la geolocalización

**Panel de locales:**
- [ ] Solo store_owner puede acceder al dashboard
- [ ] Se pueden subir imágenes de prendas
- [ ] Las prendas subidas aparecen en el perfil público
- [ ] Las métricas se actualizan correctamente

**Búsqueda con filtros:**
- [ ] La búsqueda por texto devuelve resultados relevantes
- [ ] Los filtros funcionan combinados (categoría + estilo + precio + distancia)
- [ ] El ordenamiento por precio / distancia / rating funciona
- [ ] El estado vacío se muestra cuando no hay resultados

**Outfits IA:** ⏸ Fuera del MVP — Fase 2

**Valoraciones:**
- [ ] No se puede valorar más de una vez el mismo local
- [ ] El rating promedio se actualiza al agregar valoración
- [ ] Los tags se guardan correctamente

#### Performance checks
- [ ] Lighthouse score > 85 en mobile
- [ ] First Contentful Paint < 2s
- [ ] Las imágenes están en WebP y tienen lazy loading
- [ ] No hay console.errors en producción

#### Protocolo
- Documentar todos los bugs encontrados en `/docs/bugs.md`
- Formato: `[MÓDULO] Descripción del bug — Severidad: Alta/Media/Baja`
- Severidad Alta = bloquea el deploy
- Priorizar bugs de autenticación y seguridad sobre UI

---

## Archivos de coordinación

```
/docs
  prompt-maestro.md   ← INMUTABLE. Fuente de verdad del producto
  agent-teams.md      ← Este archivo
  sprint-actual.md    ← Generado por el Orquestador
  progreso.md         ← Estado de cada módulo
  decisiones.md       ← Decisiones técnicas importantes y su razón
  pendientes.md       ← Cosas que un agente necesita de otro
  bugs.md             ← Bugs encontrados por QA
```

---

*Cada agente debe leer `docs/prompt-maestro.md` completo antes de escribir su primera línea de código.*
