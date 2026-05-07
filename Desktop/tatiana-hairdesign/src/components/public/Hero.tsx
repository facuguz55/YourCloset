"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";

const BRANCHES = [
  {
    id: "larioja",
    label: "La Rioja 2718 | Centro",
    phone: process.env.NEXT_PUBLIC_WA_LARIOJA ?? "5493424368868",
  },
  {
    id: "miraflores",
    label: "Complejo Miraflores",
    phone: process.env.NEXT_PUBLIC_WA_MIRAFLORES ?? "5493424216359",
  },
  {
    id: "moreno",
    label: "Moreno 2599",
    phone: process.env.NEXT_PUBLIC_WA_MORENO ?? "5493424443516",
  },
] as const;

interface HeroProps {
  subtitle: string;
}

export function Hero({ subtitle }: HeroProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-darker">
        {/* Patrón de fondo sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A96E 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow dorado sutil */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-gold opacity-5 blur-3xl" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Línea decorativa */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px w-12 bg-gold/50" />
            <span className="text-xs font-medium tracking-[0.3em] text-gold/80 uppercase">
              Santa Fe · Argentina
            </span>
            <div className="h-px w-12 bg-gold/50" />
          </div>

          {/* Nombre principal */}
          <h1
            className="mb-4 text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tatiana{" "}
            <span className="block text-gold italic">Martinez</span>
            <span className="block text-3xl font-normal tracking-[0.15em] md:text-4xl">
              Hair Design
            </span>
          </h1>

          {/* Separador dorado */}
          <div className="my-6 h-px w-24 bg-gold" />

          {/* Tagline */}
          <p className="mb-10 max-w-md text-base leading-relaxed text-muted md:text-lg">
            {subtitle}
          </p>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-none border border-gold bg-transparent px-10 py-4 text-sm font-medium tracking-[0.15em] text-gold uppercase transition-all duration-300 hover:bg-gold hover:text-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <MessageCircle className="size-4 transition-transform group-hover:scale-110" />
            Reservar turno
          </button>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <ChevronDown className="size-5 text-gold" />
          </div>
        </div>
      </section>

      {/* Modal selector de sucursal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-dark-border bg-dark-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="mb-2 text-xl text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ¿A qué sucursal?
            </h3>
            <p className="mb-6 text-sm text-muted">
              Elegí tu sucursal para reservar por WhatsApp.
            </p>

            <div className="flex flex-col gap-3">
              {BRANCHES.map((branch) => (
                <a
                  key={branch.id}
                  href={`https://wa.me/${branch.phone}?text=${encodeURIComponent("Hola, quiero reservar un turno.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded border border-dark-border bg-dark-alt px-4 py-3.5 text-sm text-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <MessageCircle className="size-4 shrink-0 text-gold" />
                  {branch.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full text-xs text-muted-dark hover:text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
