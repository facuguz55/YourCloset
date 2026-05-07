interface AboutSectionProps {
  text: string;
}

export function AboutSection({ text }: AboutSectionProps) {
  return (
    <section className="bg-darker py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* Texto */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
                Sobre Tatiana
              </span>
            </div>
            <h2
              className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              20+ años{" "}
              <span className="italic text-gold">rompiendo reglas</span>
            </h2>
            <p className="mb-6 text-base leading-relaxed text-muted">{text}</p>
            <ul className="space-y-2.5">
              {[
                "Estilista y Colorista Internacional",
                "Especialista en técnicas de color y tratamientos",
                "Formadora de profesionales",
                "Franquiciante en expansión",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/5] w-full rounded-lg bg-dark-alt border border-dark-border flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-6xl text-gold/20 leading-none"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  TM
                </div>
                <div className="mt-2 text-xs tracking-[0.2em] text-muted-dark uppercase">
                  Hair Design
                </div>
              </div>
            </div>
            {/* Badge flotante */}
            <div className="absolute -bottom-4 -left-4 rounded-lg border border-gold/30 bg-dark-card px-4 py-3">
              <div className="text-2xl font-bold text-gold" style={{ fontFamily: "var(--font-playfair)" }}>
                20+
              </div>
              <div className="text-xs text-muted">años de experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
