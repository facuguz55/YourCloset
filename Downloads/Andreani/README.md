# Andreani Clone — Guía de Placeholders

Prototipo interactivo del sistema de seguimiento de Andreani.  
Construido con React 18 + Babel Standalone (sin build tools).

---

## Cómo correr localmente

```bash
npx serve .
# luego abrí: http://localhost:3000/Andreani.html
```

> **Importante:** necesitás un servidor local (no abrir el HTML directo desde el explorador de archivos) para que las imágenes de `assets/` carguen correctamente.

---

## Estructura del proyecto

```
andreani-clone/
├── Andreani.html          ← App principal (todo en un archivo React/Babel)
├── assets/
│   ├── logo.png           ← Logo Andreani
│   ├── hero-seguir.png    ← Ilustración hero tab "Seguir envío"
│   ├── edificio.png       ← Edificio decorativo hero
│   ├── edificio-cerca.png ← Edificio sección "Estamos cerca"
│   ├── saludo.gif         ← Chatbot Andi (botón WhatsApp)
│   ├── ecommerce-award.png← Premio eCommerce
│   ├── box.svg            ← Ícono "Hacer un envío"
│   ├── boxes.svg          ← Ícono "Seguir mis envíos"
│   ├── question-circle.svg← Ícono "Preguntas frecuentes"
│   ├── servicios_paqueteria.svg
│   ├── servicios-bigger.svg
│   ├── servicios-cambios.svg
│   ├── servicios-devolucion.svg
│   ├── servicios-cartadocumento.svg
│   └── servicios-andreanienvios.svg
└── README.md
```

---

## Placeholders — Pantalla de Seguimiento

La función `makeTrackingData(trackingNumber)` en `Andreani.html` es el **único lugar** que necesitás modificar para conectar un backend real.

### Cómo conectar tu API

Buscá esta función en `Andreani.html` (aprox. línea 280):

```js
function makeTrackingData(trackingNumber) {
  return {
    // Reemplazá este objeto con la respuesta de tu API
  };
}
```

**Reemplazala por:**

```js
async function makeTrackingData(trackingNumber) {
  const res = await fetch(`https://tu-api.com/seguimiento/${trackingNumber}`);
  const data = await res.json();
  return data; // debe tener la estructura indicada abajo
}
```

---

### Estructura de datos esperada

```js
{
  // ── DATOS GENERALES ──────────────────────────────────────
  numeroSeguimiento: string,
  // Ej: "360002960577390"

  nombreDestinatario: string,
  // Ej: "Juan Pérez"
  // Se muestra como: "El envío de [Juan Pérez] N° 360002960577390"

  estadoActual: string,
  // Ej: "Entregado" | "En camino" | "En sucursal" | "Pendiente de ingreso"
  // Se muestra grande debajo del nombre

  estadoColor: "green" | "red" | "orange",
  // "green"  → estado positivo (Entregado)
  // "red"    → estado con problema (No entregado, Devuelto)
  // "orange" → estado en proceso (En camino, En sucursal)

  mensajeEstado: string,
  // Ej: "Tu envío fue entregado el lunes 11 de mayo a las 12:40hs"
  // Se muestra en el banner de color debajo del título

  // ── TIMELINE HORIZONTAL (barra de progreso con 4 pasos) ──
  pasos: [
    {
      label: string,       // Nombre del paso. Ej: "Pendiente de ingreso"
      fecha: string,       // Ej: "11-05-2026"
      completado: boolean, // true = círculo verde con check
      actual: boolean,     // true = es el paso actual (círculo con halo)
    },
    // ... (siempre 4 pasos en este orden:)
    // 1. Pendiente de ingreso
    // 2. Ingresado
    // 3. En camino
    // 4. Entregado / No entregado / En sucursal
  ],

  // ── TIMELINE VERTICAL (paso a paso detallado) ────────────
  pasosDetalle: [
    {
      estado: string,   // Nombre del estado. Ej: "Entregado"
      icono: "flag" | "truck" | "box" | "clock",
      // "flag"  → Entregado
      // "truck" → En camino / En tránsito
      // "box"   → Ingresado / En sucursal
      // "clock" → Pendiente de ingreso
      eventos: [
        {
          fecha:   string, // Ej: "11-05-2026"
          hora:    string, // Ej: "12:41 hs."
          mensaje: string, // Ej: "Ya entregamos tu envío."
        },
        // ... (puede tener múltiples eventos por estado)
      ]
    },
    // ... (en orden cronológico inverso: más reciente primero)
  ],
}
```

---

## Placeholders — Pantalla de Cotización

La cotización usa datos estáticos de demo. Para conectarla:

Buscá `const QUOTES = [` en `Andreani.html` y reemplazalo con una llamada a tu API que devuelva:

```js
[
  {
    name:  string,   // "Andreani Estándar"
    days:  string,   // "3 a 5 días hábiles"
    price: number,   // 4250 (en ARS, sin formato)
    feats: string[], // ["Seguimiento online", "Entrega a domicilio"]
    rec:   boolean,  // true = muestra badge "Recomendado"
  }
]
```

---

## Placeholders — Sucursales

Buscá `const sucs = [` en `SucursalesView` y reemplazalo con:

```js
[
  {
    name: string, // "Sucursal Centro"
    addr: string, // "Av. Corrientes 1234, CABA"
    hrs:  string, // "Lun a Vie 9:00 - 18:00"
    tel:  string, // "0810-122-1111"
  }
]
```

---

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | UI components |
| ReactDOM | 18.3.1 | Rendering |
| Babel Standalone | 7.29.0 | Transpila JSX en el browser |

> Sin bundler, sin Node.js, sin build step. Todo corre directo en el browser.
