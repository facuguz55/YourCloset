# YourCloset — Checklist Pre-Ejecución
> Verificar TODO esto antes de correr Claude Code con `--dangerously-skip-permissions`

---

## ✅ 1. Credenciales y Variables de Entorno

- [ ] Completé `NEXT_PUBLIC_SUPABASE_URL` en `.env`
- [ ] Completé `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env`
- [ ] Completé `SUPABASE_SERVICE_ROLE_KEY` en `.env`
- [ ] Completé `NEXT_PUBLIC_SUPABASE_URL` en `.env` ← ya está, verificar que sea correcta
- [ ] (No se necesitan keys adicionales de auth — Supabase Auth usa las mismas keys de Supabase)
- [ ] ~~`OPENAI_API_KEY`~~ — no requerida en el MVP (Fase 2)
- [ ] ~~`NEXT_PUBLIC_MAPBOX_TOKEN`~~ — no requerida, usamos Leaflet + OSM (sin API key)
- [ ] (Sin webhook secret — Supabase Auth no requiere esta configuración)
- [ ] El archivo `.env` NO está trackeado por git (verificar con `git status`)

---

## ✅ 2. Supabase

- [ ] Proyecto creado en https://app.supabase.com
- [ ] Extensión PostGIS habilitada (para queries de geolocalización con `ST_Distance`)
- [ ] Storage buckets creados: `products`, `stores`, `avatars`
- [ ] Políticas de Storage configuradas (público para lectura, privado para escritura)
- [ ] URL del proyecto copiada al `.env`
- [ ] Anon key copiada al `.env`
- [ ] Service role key copiada al `.env`

---

## ✅ 3. Supabase Auth

- [ ] Supabase Auth habilitado en el proyecto (viene por defecto)
- [ ] Provider de Google configurado en Authentication → Providers
- [ ] Email confirmación configurada (o desactivada para desarrollo)
- [ ] Trigger SQL creado: `handle_new_user()` que sincroniza `auth.users` → `public.users`
- [ ] URL del site configurada en Authentication → URL Configuration (`http://localhost:3000`)
- [ ] Redirect URLs agregadas: `http://localhost:3000/auth/callback`

---

## ✅ 4. OpenAI — Fase 2 (no requerido para el MVP)

> Cuando estés listo para activar la búsqueda por imagen y los outfits con IA:
> - Generá la API key en https://platform.openai.com/api-keys
> - Descomentá `OPENAI_API_KEY` y `UPSTASH_REDIS_*` en el `.env`
> - Configurá créditos y límite de gasto en tu cuenta de OpenAI

---

## ✅ 5. Leaflet + OpenStreetMap

- [ ] Sin cuenta requerida ✅
- [ ] Sin API key requerida ✅
- [ ] Instalar paquetes cuando se inicialice el proyecto: `npm install leaflet react-leaflet leaflet.markercluster`
- [ ] Verificar que el componente del mapa se importa con `dynamic(() => ..., { ssr: false })` en Next.js

---

## ✅ 6. Archivos del Proyecto

- [ ] `/docs/prompt-maestro.md` existe y tiene más de 2.000 palabras
- [ ] `/docs/agent-teams.md` existe con los 6 agentes definidos
- [ ] `/reference/BOCETO_HOME_YOUR_CLOSET.png` existe (imagen de referencia UI)
- [ ] `.env` existe con todos los campos (aunque algunos vacíos se completan más adelante)
- [ ] `.gitignore` incluye `.env` y `node_modules`

---

## ✅ 7. Entorno de Desarrollo

- [ ] Node.js v18+ instalado (`node --version`)
- [ ] npm/yarn/pnpm disponible
- [ ] Git inicializado en la carpeta del proyecto (`git init`)
- [ ] Primer commit hecho con la estructura base (sin `.env`)
- [ ] Claude Code instalado (`claude --version`)

---

## ✅ 8. Entendimiento del Proyecto (antes de invocar agentes)

- [ ] Leí `prompt-maestro.md` completo
- [ ] Entendí que YourCloset NO es un marketplace (no hay ventas dentro de la app)
- [ ] Entendí el orden de ejecución de agentes (ver `agent-teams.md` → Orquestador)
- [ ] Tengo claro qué funciones son MVP y cuáles son Fase 2
- [ ] El primer agente a invocar es el **Orquestador**, luego el **Backend/DB**

---

## ✅ 9. Seguridad

- [ ] `.env` está en `.gitignore` ✓
- [ ] Las API keys de OpenAI NUNCA van en archivos del cliente (`NEXT_PUBLIC_*`)
- [ ] Las llamadas a OpenAI van SIEMPRE por API Routes (server-side)
- [ ] Las rutas del dashboard están protegidas por middleware de Next.js (verificando sesión de Supabase Auth)
- [ ] RLS policies de Supabase están configuradas antes de ir a producción

---

## ✅ 10. Comando de Activación

Cuando todo lo anterior esté verificado, iniciá el Orquestador con:

```bash
cd /home/claude/yourcloset
claude --dangerously-skip-permissions
```

Y en el primer mensaje al Orquestador, escribí:

```
Sos el Agente Orquestador de YourCloset. Leé docs/prompt-maestro.md y docs/agent-teams.md completos, luego generá docs/sprint-actual.md con el plan de la primera semana de desarrollo, empezando por la creación del schema de Prisma.
```

---

*No salteés ningún punto de esta lista. Cada credencial faltante va a romper el flujo del agente correspondiente.*
