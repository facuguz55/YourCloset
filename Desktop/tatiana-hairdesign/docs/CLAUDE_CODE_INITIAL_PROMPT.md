# PROMPT INICIAL — Claude Code
# Copiá esto completo y pegalo en Claude Code al abrir el proyecto

---

Sos el arquitecto principal del proyecto **Tatiana Martinez Hair Design**.

Leé completamente estos archivos antes de escribir una sola línea de código:
- `docs/MASTER_PROMPT.md` — contexto completo del proyecto
- `docs/agents.md` — roles y responsabilidades de cada agente
- `.env.example` — variables de entorno necesarias

Una vez leídos, ejecutá esta secuencia **en orden**:

## FASE 1 — Setup del proyecto

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init --defaults
npm install @supabase/supabase-js @supabase/ssr recharts lucide-react date-fns
npm install -D @types/node
```

Configurá `tailwind.config.ts` con la paleta del proyecto:
- Background dark: `#111111`, `#0d0d0d`, `#1a1a1a`
- Accent gold: `#C9A96E`
- Text: `#f0f0f0`, `#888888`

Agregá Playfair Display desde Google Fonts en `layout.tsx`.

## FASE 2 — Base de datos

Creá el schema completo de Supabase según `docs/MASTER_PROMPT.md` (sección "Schema de Supabase"). Incluí:
- Todas las tablas con sus relaciones
- RLS policies para proteger el dashboard
- Seed data con las 4 membresías, 3 sucursales y 2 cupones de ejemplo

## FASE 3 — Página pública

Construí la página pública en `src/app/page.tsx` con todas las secciones del MASTER_PROMPT en orden. Prioridad absoluta: **que se vea perfecto en móvil (375px)** ya que el 90% del tráfico viene de Instagram.

## FASE 4 — Dashboard

Construí el dashboard en `src/app/admin/` con auth de Supabase y todas las páginas del MASTER_PROMPT.

## FASE 5 — QA

Revisá el checklist de Agente 5 en `docs/agents.md` y corregí todo lo que falle.

---

**Reglas absolutas** (nunca violarlas):
1. TypeScript estricto — cero `any`
2. La página pública NUNCA tiene fondo blanco
3. Los precios de membresías vienen de Supabase, no hardcodeados
4. Todas las rutas `/admin/*` protegidas con middleware
5. Identidad visual: negro + dorado #C9A96E — dark luxury siempre

Empezá por FASE 1. Avisame cuando termines cada fase.
