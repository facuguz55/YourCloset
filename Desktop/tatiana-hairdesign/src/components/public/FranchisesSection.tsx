import { ArrowRight, TrendingUp } from "lucide-react";

export function FranchisesSection() {
  return (
    <section id="franquicias" className="relative overflow-hidden bg-darker py-20 md:py-28">
      {/* Glow de fondo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-gold opacity-5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-gold/30" />
          <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
            Expandite con nosotros
          </span>
          <div className="h-px w-12 bg-gold/30" />
        </div>

        <h2
          className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Sistema de{" "}
          <span className="italic text-gold">Franquicias</span>
        </h2>

        <p className="mx-auto mb-8 max-w-md text-base text-muted">
          Sumarte a la familia Tatiana Martinez. Un modelo de negocio probado,
          respaldo total y una marca reconocida en Argentina.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: TrendingUp, label: "Modelo de negocio rentable y probado" },
            { icon: ArrowRight, label: "Soporte y capacitación continua" },
            { icon: ArrowRight, label: "Marca con identidad sólida" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-lg border border-dark-border bg-dark-card p-4 text-sm text-foreground/80"
            >
              <Icon className="mx-auto mb-2 size-5 text-gold" />
              {label}
            </div>
          ))}
        </div>

        <a
          href="https://tatianamartinez.com.ar/franquicias"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 border border-gold bg-gold px-8 py-3.5 text-sm font-medium tracking-[0.1em] text-darker uppercase transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          Quiero ser franquiciado
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
