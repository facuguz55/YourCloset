import { GraduationCap, Users, Award } from "lucide-react";

export function AcademiaSection() {
  return (
    <section id="academia" className="bg-dark py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Texto */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
                Formación profesional
              </span>
            </div>
            <h2
              className="mb-4 text-3xl font-bold text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Academia{" "}
              <span className="italic text-gold">Tatiana Martinez</span>
            </h2>
            <p className="mb-6 text-base leading-relaxed text-muted">
              Formamos a los profesionales del mañana. Cursos y capacitaciones de
              alta calidad para estilistas que quieren marcar la diferencia.
            </p>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: "Cursos presenciales y online" },
                { icon: Users, text: "Clases grupales e individuales" },
                { icon: Award, text: "Certificación profesional avalada" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-foreground/80">
                  <Icon className="size-4 text-gold" />
                  {text}
                </div>
              ))}
            </div>

            <a
              href="https://www.instagram.com/tatianamartinezestilista.ok"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-gold/50 px-6 py-3 text-xs font-medium tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10"
            >
              Más información
            </a>
          </div>

          {/* Visual */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Alumnos formados", value: "1M+" },
              { label: "Años de enseñanza", value: "15+" },
              { label: "Técnicas enseñadas", value: "50+" },
              { label: "Sucursales academia", value: "3" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-dark-border bg-dark-card p-4 text-center"
              >
                <div
                  className="text-2xl font-bold text-gold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
