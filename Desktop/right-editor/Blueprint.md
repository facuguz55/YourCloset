# Blueprint.md — Right Botines Video Editor
## Método BLAST — Fase B

---

## 1. Problema que resuelve
Right Botines necesita una herramienta interna para procesar videos de manera automática:
- Eliminar silencios del video
- Agregar subtítulos animados (una palabra a la vez, estilo "ta ta ta ta")
- Estampar el logo de Right Botines en todos los videos

Sin esta herramienta, el proceso es manual, lento y dependiente de software externo como CapCut.

---

## 2. Resultado esperado
Un video MP4 procesado con:
- Silencios eliminados (usando FFmpeg)
- Subtítulos quemados (hardcoded) animados, palabra a palabra
- Logo de Right Botines superpuesto en posición configurable
- Guardado en Supabase Storage + descarga directa

---

## 3. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite, deploy en Vercel |
| Base de datos | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Procesamiento de video | FFmpeg (en contenedor N8N) |
| Transcripción | Whisper local (8GB RAM servidor) |
| Backend/orquestación | N8N (Docker/Portainer) ✓ confirmado |
| Autenticación | Ninguna (herramienta interna, 1 usuario) |

---

## 4. Funcionalidades principales

### 4.1 Pantalla de Proyectos (Home)
- Listado de todos los proyectos (cards con thumbnail, nombre, estado, fecha)
- Botón "Nuevo Proyecto"
- Estados: Pendiente / Procesando / Completado / Error
- Cada proyecto = 1 video

### 4.2 Creación de Proyecto
- Nombre del proyecto
- Selección de formato: 16:9 / 9:16 / 1:1 / 4:5 / Personalizado
- Upload del video fuente (MP4, MOV, formatos iPhone como .HEVC/.MOV)
- Configuración de opciones de procesamiento

### 4.3 Editor / Panel de Proyecto
- Preview del video subido
- Toggles de procesamiento:
  - [x] Quitar silencios
  - [x] Agregar subtítulos animados
  - [x] Agregar logo Right Botines
- Configuración de subtítulos: font, tamaño, color, posición
- Configuración de logo: posición (esquinas + centro), tamaño, opacidad
- Botón "Procesar Video"

### 4.4 Procesamiento
- Barra de progreso en tiempo real (via Supabase Realtime)
- Steps visibles: "Subiendo" → "Transcribiendo" → "Quitando silencios" → "Renderizando subtítulos" → "Agregando logo" → "Finalizando"

### 4.5 Resultado
- Preview del video procesado
- Botón de descarga directa
- Video guardado en Supabase Storage

---

## 5. Flujo de datos

```
Usuario sube video
    ↓
Frontend → Supabase Storage (video original)
    ↓
Frontend → POST Webhook N8N (project_id + opciones)
    ↓
N8N Workflow:
  Nodo 1: Webhook — recibe project_id + opciones
  Nodo 2: Supabase — actualiza status → "processing"
  Nodo 3: HTTP Request — descarga video de Supabase Storage
  Nodo 4: Execute Command — FFmpeg corta silencios
  Nodo 5: Execute Command — Whisper transcribe con timestamps por palabra
  Nodo 6: Execute Command — FFmpeg quema subtítulos animados (formato ASS)
  Nodo 7: Execute Command — FFmpeg superpone logo PNG
  Nodo 8: HTTP Request — sube MP4 procesado a Supabase Storage
  Nodo 9: Supabase — actualiza status → "completed" + processed_url
    ↓
Frontend escucha Supabase Realtime → detecta completado
    ↓
Preview + descarga disponible
```

### Variables de entorno
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_URL=   # URL del webhook en el servidor Docker
```

---

## 6. Schema Supabase

### Tabla: `projects`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
format          text            -- '16:9', '9:16', '1:1', '4:5', 'custom'
width           int
height          int
status          text DEFAULT 'pending'  -- 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
progress        int DEFAULT 0           -- 0-100
step            text                    -- mensaje de paso actual para mostrar en UI
original_url    text                    -- URL Supabase Storage video original
processed_url   text                    -- URL Supabase Storage video procesado
thumbnail_url   text
duration        float                   -- duración en segundos
options         jsonb                   -- { removeSilence, subtitles, logo, subtitleConfig, logoConfig }
error_message   text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### Estructura del campo `options` (jsonb)
```json
{
  "removeSilence": true,
  "subtitles": true,
  "logo": true,
  "subtitleConfig": {
    "font": "Arial",
    "size": 48,
    "color": "#FFFFFF",
    "position": "bottom"
  },
  "logoConfig": {
    "position": "bottom-right",
    "size": 15,
    "opacity": 100
  }
}
```

---

## 7. Diseño Visual

### Paleta
- Background: `#050508`
- Surface: `#0d0d14`
- Surface elevated: `#13131f`
- Border: `#1e1e30`
- Accent primario: `#00d4ff` (cyan neón)
- Accent secundario: `#00ffb3` (verde agua)
- Accent terciario: `#0099ff` (azul eléctrico)
- Text primario: `#f0f4ff`
- Text secundario: `#6b7a99`
- Error: `#ff4060`
- Success: `#00ffb3`

### Tipografía
- Display: `Outfit` (bold, titles)
- Body: `DM Sans` (clean, readable)

### Estética
- Dark minimalista con detalles neón
- Glassmorphism sutil en cards
- Bordes con glow cyan/verde en hover
- Inspiración: referencias CapCut dark + editor profesional

---

## 8. Formatos de video aceptados
- `.mp4`
- `.mov`
- `.m4v`
- `.hevc` / `.heic` (iPhone)

---

## 9. Lo que NO hace esta app
- No tiene login/auth
- No soporta múltiples usuarios
- No edita el video manualmente (no es timeline editor)
- No sube a redes sociales automáticamente

---

## 10. Fases de desarrollo

| Fase | Entregable |
|------|-----------|
| 1 | UI completa en Claude Code (React + Vite) |
| 2 | Integración Supabase (DB + Storage + Realtime) |
| 3 | Pipeline N8N (FFmpeg + Whisper en Docker) |
| 4 | Conexión frontend ↔ N8N webhook |
| 5 | Testing end-to-end + deploy Vercel |
