# YourCloset — Prompt Maestro
> Documento de referencia central para todos los agentes de desarrollo.
> Versión 1.0 — Santa Fe, Argentina

---

## 1. Visión del Producto

**YourCloset** es una aplicación web que conecta a personas con los locales de indumentaria de su ciudad que venden exactamente el estilo de ropa que les gusta — sin tener que recorrer shopping centers ni saber de antemano dónde buscar.

### El problema real

Cuando alguien quiere comprar ropa, la pregunta siempre es la misma: *¿dónde voy a encontrar lo que me gusta?* Las opciones actuales son insatisfactorias:
- Los marketplaces (MercadoLibre, etc.) venden de todo y no tienen criterio de estilo personal.
- Instagram y TikTok muestran ropa pero no indican dónde comprarla localmente.
- Google Maps muestra locales pero no su catálogo ni si el estilo es compatible con el usuario.
- No existe ninguna herramienta donde puedas subir una foto de ropa que viste y encontrar dónde comprarlo en tu ciudad.

### La solución

YourCloset resuelve esto en tres capas:
1. **Conoce tu estilo** — una encuesta visual estilo Pinterest al registrarse que define el perfil de gusto del usuario.
2. **Busca con IA** — buscador por imagen (subís foto → IA encuentra prendas similares en locales locales) y por texto con filtros inteligentes.
3. **Muestra el mapa** — mapa interactivo donde cada pin es un local con su perfil completo, prendas, y cómo contactarlo.

### Lo que YourCloset NO es
No es un marketplace. No se vende nada dentro de la app. No hay carrito, no hay checkout, no hay delivery. YourCloset es un **directorio inteligente y personalizado** de locales de indumentaria, con IA para matchear estilos.

---

## 2. Usuario Objetivo

### Usuario Final (Comprador)

**Perfil principal:** Persona de 15 a 45 años, habitante de Santa Fe capital, que usa el celular para explorar moda pero no sabe dónde comprar localmente lo que le gusta.

**Perfil secundario:** Cualquier persona entre 10 y 80 años — la app debe ser usable por cualquier rango etario. Simplicidad extrema es un requisito de diseño, no una característica opcional.

**Comportamiento:**
- Sigue tendencias en redes sociales pero compra en locales físicos.
- Guarda fotos de outfits que le gustan sin saber dónde conseguirlos.
- Le frustra entrar a un local y que no venda su estilo.
- Valora recomendaciones personalizadas por encima de catálogos genéricos.

**Jobs to be done:**
- "Quiero encontrar locales de mi ciudad que vendan el estilo que me gusta."
- "Tengo esta foto de un look, quiero saber dónde consigo algo así en Santa Fe."
- "Quiero armar un outfit completo sin ir a cinco locales distintos."

---

### Usuario Negocio (Dueño de Local)

**Perfil:** Dueño o encargado de un local de indumentaria en Santa Fe. Puede o no tener tienda online. Tiene Instagram pero no sabe cómo llevar tráfico desde ahí a ventas reales.

**Pain points:**
- La gente no lo encuentra en el mapa.
- No tiene una landing page profesional propia.
- No puede medir cuánta gente lo busca o ve su perfil.
- Quiere diferenciarse de la competencia pero no tiene herramientas.

**Jobs to be done:**
- "Quiero que la gente que busca mi estilo me encuentre primero."
- "Quiero tener una vitrina digital profesional sin pagar un sitio web."
- "Quiero saber cuánta gente vio mi perfil y qué prendas interesan más."

---

## 3. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|--------------|
| Frontend | Next.js 14 (App Router) | SSR, rutas protegidas, API routes integradas |
| Estilos | Tailwind CSS + shadcn/ui | Sistema de diseño consistente, rápido |
| Autenticación | Supabase Auth | Auth + DB + Storage en un solo servicio, RLS nativa, sin sincronización externa |
| Base de datos | Supabase (PostgreSQL) | Realtime, Storage para imágenes/video, RLS policies |
| ORM | Prisma | Type-safety, migrations, schema declarativo |
| Mapa interactivo | Leaflet + OpenStreetMap | 100% gratis, open source, sin API key, sin bloqueos geográficos |
| *(Fase 2)* IA — Imagen | OpenAI GPT-4o Vision | Búsqueda por foto — fuera del MVP |
| *(Fase 2)* IA — Outfits | OpenAI GPT-4o | Outfits generados por IA — fuera del MVP |
| Storage | Supabase Storage | Fotos de prendas, videos opcionales, avatares, logos de locales |
| Deploy | Vercel | CI/CD automático, edge functions, integración con Next.js |
| *(Fase 2)* Rate Limiting | Upstash Redis | Para controlar llamadas a OpenAI — no necesario en MVP |

### Arquitectura de roles (Supabase Auth + user_metadata)

Los roles se almacenan en `user_metadata.role` al momento del registro y se verifican mediante RLS policies en Supabase y middleware en Next.js:

```
user_metadata.role:
  - "user"        → usuario final, acceso a búsqueda y mapa
  - "store_owner" → dueño de local, acceso al panel de negocio
  - "admin"       → acceso total, moderación, gestión de locales
```

El middleware de Next.js (`middleware.ts`) usa el cliente de Supabase server-side para verificar sesión y rol en cada request. No hay contenido público: todo requiere autenticación.

**Ventaja clave:** Las RLS policies de Supabase usan `auth.uid()` directamente, lo que significa que la seguridad de datos está garantizada a nivel de base de datos — sin necesidad de webhooks ni sincronización entre servicios externos.

---

## 4. Funcionalidades del MVP

### 4.1 Onboarding y Perfil de Estilo (Usuario)

**Encuesta de gustos estilo Pinterest** — obligatoria al registrarse por primera vez:
- El usuario ve grillas de imágenes de distintos estilos de ropa (streetwear, formal, casual, sport, bohemio, minimalista, etc.)
- Selecciona los que le gustan con un tap (sistema de "me gusta / no me gusta" visual)
- El sistema genera un `style_profile` que se almacena en la DB
- Este perfil alimenta el algoritmo de recomendación de locales y prendas
- Puede actualizar sus gustos desde "Mi Perfil" en cualquier momento

**Campos del style_profile:**
- Estilos preferidos (array de tags)
- Géneros de ropa (masculino / femenino / unisex / sin preferencia)
- Rango de precio estimado (económico / medio / premium)
- Talle aproximado (para futuros filtros)

---

### 4.2 Home — Feed Personalizado

Pantalla principal post-onboarding. Inspirada en el boceto `/reference/BOCETO_HOME_YOUR_CLOSET.png`:

**Componentes del home:**
1. **Barra de búsqueda** — sticky en la parte superior. Acepta texto con filtros combinables. *(Fase 2: búsqueda por imagen y por voz con IA)*
2. **Filtros horizontales scroll** — Género / Precio / Estilo / Talle / Distancia
3. **Grilla de prendas algorítmica** — layout masonry (como Pinterest), prendas de distintos locales ordenadas por compatibilidad con el style_profile del usuario. Cada card muestra: foto de la prenda, nombre del local, precio estimado (si está cargado), y distancia al usuario.
4. **Barra de navegación inferior "Liquid Glass"** — 4 iconos: Home, Mapa, Buscar, Mi Perfil. Efecto glassmorphism translúcido estilo iOS 18/Instagram. *(El ícono de Outfits se agrega en Fase 2)*

---

### 4.3 Buscador con filtros

Búsqueda por texto + filtros combinables. Sin IA en el MVP — los filtros hacen el trabajo.

**Búsqueda por texto:** El usuario escribe "campera negra" y el sistema hace búsqueda full-text contra el nombre, descripción y tags de las prendas en Supabase (usando `to_tsvector` de PostgreSQL, sin dependencia externa).

**Filtros disponibles:**
- Categoría (campera / remera / pantalón / vestido / calzado / accesorio)
- Estilo (streetwear / casual / formal / sport / bohemio / minimalista)
- Género (masculino / femenino / unisex)
- Precio (económico / medio / premium)
- Distancia al usuario (1km / 5km / 10km / toda la ciudad)
- Rating mínimo del local (3★ / 4★ / 5★)

**Ordenar resultados por:** Relevancia / Precio ↑ / Precio ↓ / Distancia / Rating

**Estado vacío:** Si no hay resultados, muestra "No encontramos prendas con esos filtros" con sugerencia de ampliar la búsqueda.

> 🔮 **Fase 2:** búsqueda por imagen con GPT-4o Vision y búsqueda por voz.

---

### 4.4 Mapa Interactivo

Implementado con Leaflet + OpenStreetMap. Pantalla accesible desde el segundo ícono de la barra de navegación.

**Comportamiento:**
- El mapa centra en Santa Fe, Argentina por defecto
- Cada local registrado aparece como un pin personalizado (ícono de percha o similar)
- El pin del usuario muestra su ubicación actual (previa aprobación del permiso de geolocalización)
- Al hacer tap en un pin de local, aparece un **bottom sheet** (panel deslizable desde abajo) con:
  - Foto de portada del local
  - Nombre y descripción breve
  - Rating con estrellas y cantidad de valoraciones
  - Tags de estilo (ej. "Streetwear", "Sport", "Femenino casual")
  - Distancia aproximada al usuario
  - Botones de acción: WhatsApp | Email | Ver tienda web | Ver perfil completo
- Panel de búsqueda y filtros superpuesto al mapa (capa UI sobre el mapa)
- Filtros del mapa: Estilo / Precio / Distancia / Rating mínimo
- Clustering automático de pins cuando hay muchos locales juntos

---

### 4.5 Outfits — Fase 2 (fuera del MVP)

> 🔮 Esta funcionalidad queda postergada para Fase 2.
>
> En Fase 2 se implementará con OpenAI GPT-4o: el usuario elige una ocasión y la IA arma un outfit completo con prendas de distintos locales registrados, con opción de swapear ítems individuales.
>
> **Condición para activar Fase 2:** tener al menos 10 locales activos con catálogo cargado.

---

### 4.6 Perfil del Local (Vista Pública)

Pantalla visible para todos los usuarios registrados. Funciona como landing page del local.

**Contenido:**
- Foto de portada + logo
- Nombre del local, descripción, dirección, horarios
- Tags de estilo e identidad (definidos por el local en su registro)
- Rating general + tags de valoración (sin texto libre)
- Galería de prendas (grid de fotos, con video opcional por prenda)
- Botones de contacto: WhatsApp | Email | Link a tienda web (Tienda Nube, Shopify, etc.)
- Ubicación en mini-mapa embebido
- Sección "Prendas destacadas" (el local puede destacar hasta 6 prendas)

---

### 4.7 Panel de Locales (Dashboard — Ruta Protegida)

Acceso exclusivo para usuarios con rol `store_owner`. Protegido por middleware de Next.js que verifica la sesión de Supabase Auth y el campo `user_metadata.role`.

**Módulos del panel:**

**Registro del local** (primera vez):
- Nombre del local
- Nombre y apellido del responsable legal
- CUIT/CUIL
- Dirección física (con autocompletado usando Nominatim/OpenStreetMap — sin API key)
- Número de WhatsApp de contacto
- Email de contacto
- Link a tienda web (opcional)
- Horarios de atención
- Foto de portada y logo

**Encuesta de identidad del local** (misma lógica que el usuario):
- Selección de estilos que maneja el local (streetwear, formal, sport, etc.)
- Géneros de ropa que vende
- Rango de precios de sus productos
- Público objetivo (edad aproximada)

Esto permite que el algoritmo vincule el local con los usuarios cuyo style_profile coincida.

**Gestión de catálogo:**
- Subir prendas: foto obligatoria + video opcional, nombre, precio, categoría, estilo, talles disponibles
- Editar / eliminar prendas
- Destacar hasta 6 prendas en el perfil
- Ver cuántas veces fue vista cada prenda

**Métricas y analíticas:**
- Visitas al perfil del local (últimos 7/30 días)
- Prendas más vistas
- Cantidad de clicks en WhatsApp / Email / Link tienda
- Posición aproximada en el algoritmo de recomendación
- Valoraciones recibidas (estrellas + tags)

---

### 4.8 Sistema de Valoraciones

**El usuario puede valorar un local después de visitarlo** (no de verlo):
- Rating de 1 a 5 estrellas
- Selección de tags predefinidos positivos: ✅ Buena atención | 👗 Gran variedad | 💰 Buen precio | 🎨 Estilo único | 📍 Fácil de ubicar
- Selección de tags predefinidos negativos: ❌ Mala atención | 📦 Poco stock | 💸 Precios altos | 🔄 No era lo que mostraban
- Sin campo de texto libre (evita moderación y spam)
- Una valoración por usuario por local

---

### 4.9 Mi Perfil (Usuario)

- Foto de perfil y nombre (sincronizado con Supabase Auth `user_metadata`)
- Actualizar style_profile (encuesta editable)
- Prendas guardadas (wishlist)
- Outfits guardados
- Locales favoritos
- Historial de búsquedas recientes

---

## 5. Flujos de Usuario Principales

### Flujo A: Primer ingreso (Usuario nuevo)

```
1. Abre la app → Pantalla de Sign Up (Supabase Auth)
2. Registra con email o Google
3. Redirigido a /onboarding
4. Encuesta visual de gustos (estilo Pinterest) — obligatoria
5. Sistema genera style_profile y lo guarda en Supabase
6. Redirigido al /home con feed personalizado
```

### Flujo B: Búsqueda por texto con filtros

```
1. Usuario en /home → tap en barra de búsqueda
2. Escribe texto (ej: "campera negra") y/o selecciona filtros
3. Frontend hace query a /api/search/text con texto + filtros
4. API Route ejecuta búsqueda full-text (to_tsvector) + filtros en Supabase
5. Resultados ordenados por relevancia / precio / distancia / rating
6. Usuario ve grilla de resultados con filtros ajustables
7. Tap en una prenda → ve el local, puede contactarlo
```

> 🔮 **Fase 2 — Flujo B2: Búsqueda por imagen**
> El usuario sube una foto → GPT-4o Vision extrae características → query en Supabase → resultados similares.

### Flujo C: Registro de local

```
1. Dueño de local accede a /sign-up → selecciona "Soy un local"
2. Supabase Auth crea la cuenta con `user_metadata.role = 'store_owner'`
3. Redirigido a /dashboard/onboarding
4. Completa registro legal del local
5. Completa encuesta de identidad de estilo
6. Sube foto de portada y logo
7. Empieza a cargar prendas al catálogo
8. Local aparece en el mapa interactivo y en el feed de usuarios
```

### Flujo D: Ver un local en el mapa

```
1. Usuario va a /map
2. Ve mapa centrado en Santa Fe con pins de locales
3. Aplica filtros (estilo, precio, distancia)
4. Tap en un pin → bottom sheet con info básica del local
5. Tap en "Ver perfil completo" → va a /store/[slug]
6. Ve catálogo completo, valoraciones, botones de contacto
7. Puede guardar como favorito o iniciar contacto por WhatsApp
```

### Flujo E: Generar outfit con IA

```
1. Usuario va a /outfits
2. Elige "Generar outfit" (o empieza desde una prenda guardada)
3. Selecciona género y ocasión (casual / sport / formal / noche)
4. IA genera combinación de 4-5 prendas de locales registrados
5. Cada prenda muestra el local donde se consigue
6. Usuario puede swapear prendas individuales
7. Guarda o comparte el outfit
```

---

## 6. Diseño y Estilo Visual

### Filosofía
Estilo **Apple minimalista clásico**. La interfaz desaparece para que el contenido (las prendas, los locales) sea el protagonista. Cada elemento tiene una razón de existir. Nada decorativo sin función.

### Referencia visual
`/reference/BOCETO_HOME_YOUR_CLOSET.png` — boceto del home con tres elementos clave:
1. Barra de búsqueda tipo MercadoLibre con filtros IA (parte superior)
2. Grilla algorítmica de prendas (cuerpo principal)
3. Barra de navegación "Liquid Glass" tipo iOS 18 / Instagram (parte inferior)

**Importante:** Los colores, iconos y palabras del boceto de referencia son solo guía de layout. NO replicar la paleta amarilla de MercadoLibre ni ningún branding ajeno.

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-background` | `#FFFFFF` | Fondo principal |
| `--color-surface` | `#F5F5F7` | Cards, paneles, inputs |
| `--color-surface-elevated` | `#FFFFFF` | Modales, bottom sheets |
| `--color-text-primary` | `#1D1D1F` | Títulos, texto principal |
| `--color-text-secondary` | `#6E6E73` | Subtítulos, metadatos |
| `--color-text-tertiary` | `#AEAEB2` | Placeholders, hints |
| `--color-accent` | `#0071E3` | CTAs, links, elementos activos |
| `--color-accent-hover` | `#0077ED` | Hover de accent |
| `--color-border` | `#D2D2D7` | Bordes, separadores |
| `--color-success` | `#34C759` | Estados positivos |
| `--color-error` | `#FF3B30` | Errores, alertas |
| `--color-glass-bg` | `rgba(255,255,255,0.72)` | Barra Liquid Glass |
| `--color-glass-border` | `rgba(255,255,255,0.3)` | Bordes glassmorphism |

### Tipografía

- **Display / Títulos grandes:** SF Pro Display (fallback: -apple-system, BlinkMacSystemFont, "Helvetica Neue")
- **Body / Texto:** SF Pro Text (mismo fallback)
- **Datos / Métricas:** SF Pro Rounded (fallback: system-ui)
- **Escala tipográfica:** xs(11px) / sm(13px) / base(15px) / md(17px) / lg(20px) / xl(24px) / 2xl(28px) / 3xl(34px)
- **Pesos:** Regular(400), Medium(500), Semibold(600), Bold(700)

### Componentes de diseño clave

**Barra de navegación "Liquid Glass":**
```css
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border-top: 0.5px solid rgba(255, 255, 255, 0.3);
border-radius: 24px 24px 0 0; /* o pill si flota */
```

**Cards de prendas:**
- Border-radius: 16px
- Box-shadow sutil: `0 2px 8px rgba(0,0,0,0.08)`
- Sin bordes visibles
- Imagen ocupa el 70% de la card
- Información compacta debajo: nombre del local, precio si existe

**Bottom Sheet (detalle de local en mapa):**
- Animated desde abajo con spring physics
- Handle pill en la parte superior
- Backdrop semitransparente

**Inputs y búsqueda:**
- Fondo `#F5F5F7`, sin borde en reposo
- Border sutil al hacer focus (`#D2D2D7`)
- Border-radius: 12px
- Altura mínima: 44px (WCAG touch target)

### Tono de comunicación
- **Claro y directo.** Sin jerga técnica ni palabras de marketing.
- **Amigable sin ser infantil.** Puede usarlo desde un adolescente hasta una persona mayor.
- **En español rioplatense** (vos, no tú).
- Ejemplos: "Buscá lo que querés usar" / "Locales cerca tuyo" / "Tu estilo, en tu ciudad"

---

## 7. Restricciones del MVP — Qué NO incluir

| ❌ Fuera del MVP | Motivo |
|-----------------|--------|
| Sistema de pagos / checkout | No es un marketplace |
| Chat entre usuario y local | Complejidad + moderación, reemplazado por WhatsApp directo |
| Notificaciones push nativas | Requiere app móvil nativa (fase 2) |
| App Store / Play Store | Fase 2 cuando haya masa crítica |
| Sistema de valoraciones con texto libre | Moderación costosa, reemplazado por tags |
| Múltiples idiomas | Solo español en MVP |
| Funcionalidad offline completa | PWA básica, no offline-first |
| **Búsqueda por imagen con IA** | Requiere OpenAI — Fase 2 |
| **Búsqueda por voz** | Fase 2 |
| **Outfits generados por IA** | Requiere OpenAI y catálogo mínimo — Fase 2 |
| Feed social entre usuarios | Fuera de scope del MVP |
| Stories / contenido efímero | Fase 2 |

---

## 8. Esquema de Base de Datos (Supabase/PostgreSQL)

### Tablas principales

```sql
users               → auth.users de Supabase + style_profile como JSONB, rol en user_metadata
stores              → locales registrados, geo como POINT, style_tags[]
products            → prendas del catálogo, store_id FK, image_urls[]
style_tags          → catálogo de tags predefinidos de estilo
store_ratings       → valoraciones de locales, positive_tags[], negative_tags[]
outfits             → (Fase 2) outfits generados por IA, items como JSONB
saved_products      → wishlist del usuario
saved_outfits       → outfits guardados
saved_stores        → locales favoritos
store_analytics     → métricas de visitas y clicks por local
search_history      → historial de búsquedas del usuario
store_owners        → relación usuario ↔ local (para multi-local futuro)
```

### Políticas de seguridad (RLS)
- Usuarios solo ven su propio perfil, historial y guardados
- Store owners solo editan sus propios locales y productos
- Analytics solo accesibles por el store_owner del local y admin
- Datos de contacto del local (CUIT, responsable legal) solo accesibles por admin

---

## 9. Criterios de Aceptación por Funcionalidad

### Onboarding / Encuesta de estilo
- ✅ La encuesta aparece obligatoriamente en el primer ingreso
- ✅ No se puede omitir ni skipear
- ✅ Guarda correctamente el style_profile en Supabase
- ✅ El feed del home cambia según las respuestas

### Búsqueda por imagen
> ⏸ Fuera del MVP — Fase 2

### Buscador por texto con filtros
- ✅ La búsqueda por texto devuelve prendas coincidentes
- ✅ Los filtros (categoría, estilo, género, precio, distancia, rating) funcionan combinados
- ✅ El ordenamiento por precio / distancia / rating funciona correctamente
- ✅ El estado vacío se muestra cuando no hay resultados

### Mapa interactivo
- ✅ Carga con los locales registrados visibles en el mapa
- ✅ El tap en un pin muestra el bottom sheet con info del local
- ✅ Los filtros reducen correctamente los pins visibles
- ✅ La geolocalización del usuario aparece cuando da el permiso

### Panel de local — Catálogo
- ✅ El dueño puede subir prendas con foto y precio
- ✅ Las prendas aparecen en el perfil público del local
- ✅ Las prendas aparecen en los resultados de búsqueda
- ✅ El dueño puede editar y eliminar prendas

### Panel de local — Analíticas
- ✅ Se registra cada visita al perfil del local
- ✅ Se registra cada click en WhatsApp / Email / Link tienda
- ✅ El dashboard muestra los datos de los últimos 7 y 30 días

### Outfits con IA
> ⏸ Fuera del MVP — Fase 2

### Sistema de valoraciones
- ✅ Solo puede valorar un usuario autenticado
- ✅ Una sola valoración por usuario por local (no puede repetir)
- ✅ Los tags predefinidos se guardan correctamente
- ✅ El rating promedio se actualiza en tiempo real en el perfil del local

---

## 10. Consideraciones Técnicas Especiales

### Búsqueda full-text en Supabase (sin IA)
Se usa `to_tsvector` de PostgreSQL nativo. Configurar en la migración:
```sql
-- Índice de búsqueda full-text sobre productos
ALTER TABLE products ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(array_to_string(style_tags,' '),''))
  ) STORED;

CREATE INDEX products_fts_idx ON products USING GIN(fts);

-- Query de búsqueda:
-- SELECT * FROM products WHERE fts @@ plainto_tsquery('spanish', 'campera negra');
```

> 🔮 **Fase 2 — OpenAI:** cuando se agregue búsqueda por imagen, se añade `OPENAI_API_KEY` al `.env` y se implementan las rutas `/api/search/image` y `/api/outfits/generate`.

### Geolocalización
- Usar la Geolocation API del browser
- Si el usuario rechaza, el mapa centra en Santa Fe (coordenadas hardcodeadas: `-31.6333, -60.7`)
- La distancia al usuario se calcula con la función `ST_Distance` de PostGIS en Supabase

### Leaflet + OpenStreetMap — Configuración
- Tile layer: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` (CartoDB Positron — estilo claro y minimalista, compatible con paleta Apple, sin API key)
- Custom markers para locales: `L.divIcon` con SVG de percha
- Clustering: plugin `leaflet.markercluster`
- Flyto animation al hacer tap en un pin: `map.flyTo([lat, lng], zoom, { animate: true })`
- Librería React: `react-leaflet` v4

### Performance
- Imágenes de prendas: lazy loading, formato WebP, servidas desde Supabase Storage con CDN
- Feed del home: paginación con cursor (infinite scroll)
- Búsqueda: debounce de 300ms en el input de texto
- Mapa: solo cargar los locales dentro del viewport visible

---

*Este documento es la fuente de verdad del proyecto. Cualquier decisión de diseño o desarrollo que no esté aquí debe consultarse antes de implementarse.*
