import { Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MembershipType } from "@/types/database";

interface MembershipsSectionProps {
  memberships: MembershipType[];
}

function MembershipCard({ membership, index }: { membership: MembershipType; index: number }) {
  const isHighlighted = index === 2; // Membresía 3 destacada

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-6 transition-all duration-300 hover:-translate-y-0.5 ${
        isHighlighted
          ? "border-gold bg-dark-card shadow-[0_0_30px_rgba(201,169,110,0.12)]"
          : "border-dark-border bg-dark-card hover:border-gold/40"
      }`}
    >
      {/* Badge destacado */}
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full border border-gold bg-darker px-3 py-0.5 text-xs font-medium tracking-wider text-gold uppercase">
            Más popular
          </span>
        </div>
      )}

      {/* Nombre */}
      <div className="mb-4">
        <h3
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {membership.name}
        </h3>
        {membership.description && (
          <p className="mt-1 text-xs text-muted">{membership.description}</p>
        )}
      </div>

      {/* Separador */}
      <div className="mb-4 h-px bg-dark-border" />

      {/* Beneficios */}
      <ul className="mb-6 flex-1 space-y-2.5">
        {(membership.benefits?.items ?? []).map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
            <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>

      {/* Precio */}
      <div className="mt-auto">
        <div className="mb-4 h-px bg-dark-border" />
        <div className="text-center">
          <span
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {formatPrice(membership.price)}
          </span>
          <span className="ml-1 text-xs text-muted">/mes</span>
        </div>

        <a
          href={`https://wa.me/5493424368868?text=${encodeURIComponent(`Hola, me interesa la ${membership.name} (${formatPrice(membership.price)}/mes).`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 flex w-full items-center justify-center rounded-none py-3 text-xs font-medium tracking-[0.15em] uppercase transition-colors ${
            isHighlighted
              ? "border border-gold bg-gold text-darker hover:bg-gold-dark hover:border-gold-dark"
              : "border border-dark-border text-muted hover:border-gold hover:text-gold"
          }`}
        >
          Consultar
        </a>
      </div>
    </div>
  );
}

export function MembershipsSection({ memberships }: MembershipsSectionProps) {
  return (
    <section id="membresias" className="bg-darker py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
              Planes mensuales
            </span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
          <h2
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Nuestras <span className="italic text-gold">membresías</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            Elegí tu membresía y cuidamos tu cabello todo el mes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {memberships.map((membership, index) => (
            <MembershipCard key={membership.id} membership={membership} index={index} />
          ))}
        </div>

        {/* Footer tagline */}
        <p className="mt-12 text-center text-sm italic text-muted">
          &ldquo;Vos elegís la membresía. Nosotros cuidamos tu cabello todo el mes.&rdquo;
        </p>
      </div>
    </section>
  );
}
