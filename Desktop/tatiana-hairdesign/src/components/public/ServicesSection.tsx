interface Service {
  name: string;
  description: string;
  category: "cabello" | "belleza" | "bienestar";
}

const SERVICES: Service[] = [
  { name: "Peinados", description: "Peinados exclusivos para cada ocasión y estilo.", category: "cabello" },
  { name: "Cortes personalizados", description: "Cortes a medida según tu tipo de rostro y personalidad.", category: "cabello" },
  { name: "Lavados", description: "Ritual de lavado premium con productos de alta calidad.", category: "cabello" },
  { name: "Coloración", description: "Técnicas de color actualizadas y personalizadas.", category: "cabello" },
  { name: "Diseño de Color", description: "Técnica que combina tonos y estilos para realzar el cabello de forma personalizada.", category: "cabello" },
  { name: "Plastificado", description: "Alisa, hidrata y da brillo al cabello, dejándolo suave y sin frizz.", category: "cabello" },
  { name: "Nutrición Wella", description: "Tratamientos de nutrición y reparación capilar con tecnología Wella.", category: "cabello" },
  { name: "Ozono y Radiofrecuencia", description: "Estimula la circulación, oxigena la raíz y reduce la caída.", category: "cabello" },
  { name: "Keratina", description: "Alisa y reduce el frizz, dejando el cabello suave y manejable.", category: "cabello" },
  { name: "Maquillaje", description: "Maquillaje profesional para cada momento y ocasión.", category: "belleza" },
  { name: "Micropigmentación", description: "Micropigmentación de cejas y labios de larga duración.", category: "belleza" },
  { name: "Cejas y Pestañas", description: "Diseño y tratamiento profesional de cejas y pestañas.", category: "belleza" },
  { name: "Belleza de Manos", description: "Manicura y cuidado de manos de alta calidad.", category: "belleza" },
  { name: "Spa de Pies", description: "Tratamiento completo de relajación y cuidado de pies.", category: "bienestar" },
  { name: "Masajes Faciales", description: "Masajes maxilares y faciales para relajar y rejuvenecer.", category: "bienestar" },
  { name: "Spa de Cabello", description: "Experiencia spa completa para nutrir e hidratar el cabello.", category: "bienestar" },
  { name: "Estética", description: "Servicios de estética integral para el cuidado de tu piel.", category: "bienestar" },
  { name: "Masajes", description: "Masajes relajantes y terapéuticos.", category: "bienestar" },
];

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-dark-border bg-dark-card transition-all duration-300 hover:border-gold/40">
      {/* Glow en hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gold/3 rounded-lg" />
      </div>

      <div className="relative p-5">
        {/* Nombre del servicio */}
        <h3
          className="mb-2 text-lg text-gold transition-colors"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          {service.name}
        </h3>
        {/* Línea dorada */}
        <div className="mb-3 h-px w-8 bg-gold/40 transition-all duration-300 group-hover:w-14 group-hover:bg-gold" />
        {/* Descripción */}
        <p className="text-sm leading-relaxed text-muted">{service.description}</p>
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
              Lo que hacemos
            </span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
          <h2
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Nuestros{" "}
            <span className="italic text-gold">servicios</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            Cuidamos cada detalle para que salgas sintiéndote increíble.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
