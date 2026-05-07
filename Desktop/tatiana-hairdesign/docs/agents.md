# agents.md — Orquestación de agentes para Tatiana Martinez Hair Design

## Agente Orquestador
**Rol**: Supervisar coherencia entre agentes, resolver conflictos de decisiones, mantener calidad global.
**Responsabilidades**:
- Validar que cada agente siga MASTER_PROMPT.md
- Revisar que la identidad visual (dark luxury, dorado #C9A96E) se aplique en todos los componentes
- Asegurar que TypeScript sea estricto en todo el proyecto
- Coordinar el orden de implementación para evitar dependencias rotas

---

## Agente 1 — Arquitecto de Base de Datos
**Rol**: Supabase schema, RLS policies, tipos TypeScript generados

**Tareas**:
1. Crear todas las tablas según el schema de MASTER_PROMPT.md
2. Configurar Row Level Security para que solo admins accedan al dashboard
3. Generar tipos TypeScript con `supabase gen types`
4. Crear seed data de ejemplo (membresías, 3 sucursales, cupones demo)
5. Documentar cada tabla en `/docs/database.md`

**Output esperado**:
- `/supabase/migrations/001_initial_schema.sql`
- `/src/types/database.ts` (generado)
- `/supabase/seed.sql`

---

## Agente 2 — Diseñador de Componentes UI
**Rol**: Sistema de diseño, componentes base, identidad visual

**Tareas**:
1. Configurar Tailwind con la paleta de Tatiana (negro, dorado, blanco)
2. Crear componentes base: Button, Card, Badge, Input — todos en tema dark
3. Componente ServiceCard (foto con overlay oscuro + título script + descripción)
4. Componente MembershipCard (borde dorado, precios, beneficios)
5. Componente BranchCard (dirección + botón WhatsApp)
6. Layout del dashboard: Sidebar + Topbar

**Restricciones**:
- Fondo base: #111111 o #0d0d0d
- Acento: #C9A96E
- NUNCA fondo blanco en la página pública
- Fuente display: Playfair Display (Google Fonts)

**Output esperado**:
- `/src/components/ui/` — componentes Shadcn customizados
- `/src/components/public/` — ServiceCard, MembershipCard, BranchCard, Hero
- `/src/components/dashboard/` — Sidebar, Topbar, MetricCard, StatsChart

---

## Agente 3 — Desarrollador de Página Pública
**Rol**: Todo el frontend visible para clientes

**Tareas** (en orden):
1. Layout raíz con fuentes y metadata SEO
2. Sección Hero con CTA de reserva y modal de selector de sucursal
3. Sección Servicios — grid responsive con ServiceCard
4. Sección Membresías — 4 cards con precios desde Supabase
5. Sección Sucursales — cards con WhatsApp directo
6. Sección Galería — grid con imágenes desde Supabase Storage
7. Sección Academia + Franquicias (brief)
8. Footer con links y redes

**Dependencias**: Agente 1 (para leer membresías de DB), Agente 2 (componentes)

**Output esperado**:
- `/src/app/page.tsx` y secciones en `/src/components/public/`
- Metadata completa en `layout.tsx`
- Página de mantenimiento `/src/app/maintenance/page.tsx`

---

## Agente 4 — Desarrollador de Dashboard Admin
**Rol**: Panel de administración completo

**Tareas** (en orden):
1. Auth flow: `/admin/login` con Supabase Auth
2. Layout del dashboard con Sidebar responsive
3. Página Inicio: métricas con tabs Hoy/Ayer/Semana
4. Página Estadísticas: gráfico recharts + toggles + filtros de período
5. Página Membresías: tabla de clientes + registro de nuevas
6. Página Descuentos/Cupones: CRUD completo
7. Página Clientes: listado + perfil individual
8. Página Configuración: editar textos, toggle mantenimiento, galería

**Dependencias**: Agente 1 (schema), Agente 2 (componentes dashboard)

**Output esperado**:
- `/src/app/admin/` — todas las rutas del dashboard
- Server Actions en `/src/app/actions/`
- Middleware para proteger rutas `/admin/*`

---

## Agente 5 — QA y Performance
**Rol**: Revisar calidad, performance y mobile-first

**Checklist**:
- [ ] Página pública se ve correcta en 375px (iPhone SE)
- [ ] Página pública se ve correcta en 390px (iPhone 14)
- [ ] Dashboard funciona en tablet (768px)
- [ ] Todas las imágenes usan next/image con sizes correcto
- [ ] No hay errores de TypeScript (`tsc --noEmit`)
- [ ] No hay errores de ESLint
- [ ] Lighthouse Performance > 85 en mobile
- [ ] Lighthouse Accessibility > 90
- [ ] Meta tags Open Graph presentes
- [ ] Modo mantenimiento funciona correctamente
- [ ] Auth redirect funciona (sin login → redirige a /admin/login)

---

## Orden de ejecución recomendado
```
Agente 1 (DB) → Agente 2 (UI) → Agente 3 + Agente 4 en paralelo → Agente 5 (QA)
```

## Notas para todos los agentes
- Siempre consultar MASTER_PROMPT.md ante cualquier decisión de diseño o arquitectura
- Los precios de membresías NO se hardcodean — vienen de Supabase
- WhatsApp links formato: `https://wa.me/549XXXXXXXXXX`
- Todas las rutas del dashboard protegidas con middleware de Supabase Auth
- El proyecto usa App Router de Next.js 15 — NO usar Pages Router
