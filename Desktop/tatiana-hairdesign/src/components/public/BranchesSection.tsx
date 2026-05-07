import { MessageCircle, MapPin } from "lucide-react";

const BRANCHES = [
  {
    id: "larioja",
    name: "La Rioja 2718",
    subtitle: "Centro",
    phone: process.env.NEXT_PUBLIC_WA_LARIOJA ?? "5493424368868",
    tel: "3424 36-8868",
  },
  {
    id: "miraflores",
    name: "Complejo Miraflores",
    subtitle: "Zona Countries",
    phone: process.env.NEXT_PUBLIC_WA_MIRAFLORES ?? "5493424216359",
    tel: "3424 21-6359",
  },
  {
    id: "moreno",
    name: "Moreno 2599",
    subtitle: "",
    phone: process.env.NEXT_PUBLIC_WA_MORENO ?? "5493424443516",
    tel: "3424 44-3516",
  },
];

export function BranchesSection() {
  return (
    <section id="sucursales" className="bg-dark py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
              Dónde estamos
            </span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
          <h2
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Nuestras <span className="italic text-gold">sucursales</span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm text-muted">
            Tres espacios en Santa Fe para estar más cerca de vos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="group rounded-lg border border-dark-border bg-dark-card p-6 transition-all duration-300 hover:border-gold/40"
            >
              {/* Ícono */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border border-gold/20 bg-dark-alt">
                <MapPin className="size-4 text-gold" />
              </div>

              {/* Info */}
              <h3
                className="mb-1 text-lg font-semibold text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {branch.name}
              </h3>
              {branch.subtitle && (
                <p className="mb-1 text-xs text-muted">{branch.subtitle}</p>
              )}
              <p className="mb-5 text-sm text-muted-dark">{branch.tel}</p>

              {/* Separador */}
              <div className="mb-5 h-px bg-dark-border" />

              {/* CTA WhatsApp */}
              <a
                href={`https://wa.me/${branch.phone}?text=${encodeURIComponent("Hola, quiero reservar un turno.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gold transition-all hover:gap-3"
              >
                <MessageCircle className="size-4" />
                Reservar por WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
