# Tatiana Martinez Hair Design — Master Prompt

## Objetivo del proyecto
Construir una plataforma web completa para **Tatiana Martinez Hair Design**, salón de peluquería y estilismo de alta gama en Santa Fe, Argentina. El sistema tiene dos partes:
1. **Página pública** (`/`) — para clientes finales: muestra servicios, membresías, sucursales, galería y permite reservar turno
2. **Dashboard de administración** (`/admin`) — para el equipo de Tatiana: gestión de estadísticas, clientes, membresías, descuentos y configuración del sitio

## Stack tecnológico
- **Framework**: Next.js 15 (App Router)
- **Base de datos + Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Estilos**: TailwindCSS + Shadcn/ui
- **Deploy**: Vercel
- **Reservas de turno**: Calendly embed + WhatsApp directo por sucursal
- **Pagos**: No en esta etapa (mostrar membresías solo informativas)
- **Lenguaje**: TypeScript estricto

## Identidad visual (RESPETAR SIEMPRE)
- **Fondo**: Negro (#111111) o muy oscuro (#0d0d0d)
- **Acento principal**: Dorado champagne (#C9A96E)
- **Texto**: Blanco (#f0f0f0) y gris claro (#888888) para secundario
- **Tipografía display**: Playfair Display o similar serif elegante (para títulos de servicios tipo script)
- **Tipografía body**: Inter o Geist Sans
- **Estética**: Dark luxury — fotos con overlay oscuro, bordes sutiles dorados, sin gradientes recargados
- **NO usar**: colores vibrantes, fondos blancos, estilos flat corporativos

## Estructura de la página pública

### Secciones en orden:
1. **Hero** — Nombre "Tatiana Martinez Hair Design", tagline "Unimos belleza, formación y crecimiento", CTA "Reservar turno" (abre modal con selector de sucursal → WhatsApp)
2. **Sobre Tatiana** — 20+ años de experiencia, estilista y colorista internacional
3. **Servicios** — Grid de cards con foto de fondo oscura, nombre del servicio en tipografía script, descripción breve. Servicios:
   - Peinados, Cortes personalizados, Lavados, Coloración
   - Diseño de Color (técnica que combina tonos y estilos personalizados)
   - Plastificado (alisa, hidrata y da brillo — sin frizz)
   - Nutrición Wella (tratamientos de nutrición y reparación capilar)
   - Ozono y Radiofrecuencia (estimula circulación, oxigena raíz, reduce caída)
   - Keratina (alisa, reduce frizz, suave y manejable)
   - Maquillaje, Micropigmentación de cejas y labios
   - Servicio de cejas y pestañas, Belleza de manos
   - Spa de pies, Masajes maxilares y faciales, Spa de cabello, Manicura, Estética, Masajes
4. **Membresías** — 4 cards en dark con borde dorado, precios en ARS:
   - Membresía 1: 1 tratamiento hidratante + 4 brushing/mes → $105.000
   - Membresía 2: 1 tratamiento hidratante + 4 brushing/mes + 1 spa de cabello → $162.500
   - Membresía 3: 2 tratamientos hidratantes + 4 brushing/mes + 1 spa de cabello + 1 Wella Ozono → $207.500
   - Membresía 4: 2 cortes de caballero/mes → $45.000
   - Footer de membresías: "Vos elegís la membresía. Nosotros cuidamos tu cabello todo el mes."
5. **Sucursales** — 3 cards con dirección y botón WhatsApp directo:
   - La Rioja 2718 | Centro → wa.me/5493424368868
   - Complejo Miraflores → wa.me/5493424216359
   - Moreno 2599 → wa.me/5493424443516
6. **Galería** — Grid de fotos (placeholder por ahora, imágenes se cargan desde dashboard)
7. **Academia** — Sección brief: formación profesional
8. **Franquicias** — CTA que redirige a tatianamartinez.com.ar/franquicias
9. **Footer** — Logo, links, Instagram (@tatianamartinezestilista.ok), WhatsApp general

## Dashboard de administración (/admin)

### Auth
- Login con email/password via Supabase Auth
- Solo usuarios autorizados (Tatiana y equipo)
- Redirect automático a /admin/inicio si ya está logueado

### Sidebar navigation
- Inicio
- Estadísticas → Visión general
- Gestión: Ventas, Turnos, Membresías, Descuentos, Clientes
- Sitio web: Página pública, Sucursales, Configuración

### Página: Inicio
- Tabs: Hoy / Ayer / Esta semana
- Métricas: Visitas únicas, Reservas, Facturación, Ticket promedio
- Indicador de estado del sitio (activo/mantenimiento)
- Toggle rápido modo mantenimiento
- Widget de membresías activas (barras de proporción)
- Widget de cupones recientes

### Página: Estadísticas → Visión general
- Filtros: Hoy, Semana, Mes, Trimestre, Año, Personalizado
- Gráfico de barras (recharts) con datos comparativos
- Toggles para mostrar/ocultar: Visitas únicas, Reservas, Facturación, Ticket promedio
- Comparar con período anterior (checkbox)

### Página: Membresías
- Tabla de clientes con membresía activa
- Estado: activa / vencida / por vencer
- Botón para registrar nueva membresía a un cliente
- Historial de pagos por cliente

### Página: Descuentos
- Tabla de cupones: código, descuento %, vigencia, usos, límites, estado
- Crear cupón: código, descuento, fecha vencimiento, límite de usos
- Activar/desactivar cupón (toggle)
- Buscar por código

### Página: Clientes
- Listado con nombre, teléfono, membresía activa, última visita
- Perfil de cliente: historial de servicios, notas internas, membresía
- Agregar/editar cliente

### Página: Configuración
- Editar textos de la página pública (hero, about, etc.)
- Toggle modo mantenimiento con mensaje personalizable
- Gestión de galería (subir/borrar fotos)
- Gestión de sucursales (editar dirección, teléfono, WhatsApp)

## Schema de Supabase (tablas principales)
```sql
-- usuarios del dashboard
profiles (id, email, name, role)

-- clientes del salón
clients (id, name, phone, email, notes, created_at)

-- membresías
membership_types (id, name, description, price, benefits)
client_memberships (id, client_id, membership_type_id, start_date, end_date, status, paid)

-- cupones
coupons (id, code, discount_pct, valid_until, max_uses, current_uses, active)

-- visitas/analytics
page_visits (id, date, unique_visitors, source)

-- reservas
appointments (id, client_id, service, branch, date, status, notes)

-- configuración del sitio
site_config (key, value, updated_at)
```

## Restricciones y criterios de aceptación
- Mobile-first: la página pública debe verse perfecta en móvil (el 90% del tráfico viene de Instagram)
- Performance: imágenes optimizadas con next/image, lazy loading
- SEO: metadata completa, Open Graph para cada página
- Accesibilidad: contraste suficiente en modo dark
- No incluir precios hardcodeados en el código — deben venir de Supabase (editables desde dashboard)
- El modo mantenimiento debe mostrar una página elegante con logo y mensaje personalizable
- Código TypeScript estricto, sin `any`
- Componentes reutilizables en `/components/ui`

## Archivos de referencia disponibles
- `/references/` — capturas de pantalla del Instagram de Tatiana, mockups del dashboard
- `.env.local` — variables de entorno configuradas

## Comando de inicio
```bash
npx create-next-app@latest tatiana-hairdesign --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd tatiana-hairdesign
npx shadcn@latest init
```
