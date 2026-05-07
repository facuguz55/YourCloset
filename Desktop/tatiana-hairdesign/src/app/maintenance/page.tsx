import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sitio en mantenimiento | Tatiana Martinez Hair Design",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "maintenance_message")
    .single();

  const message = data?.value ?? "Estamos trabajando para vos. Volvemos pronto ✨";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-darker px-6">
      <div className="text-center">
        {/* Logo / marca */}
        <div
          className="mb-6 text-4xl font-bold italic text-gold md:text-6xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Tatiana Martinez
        </div>
        <div className="mb-10 text-xs tracking-[0.3em] text-muted uppercase">
          Hair Design
        </div>

        {/* Separador */}
        <div className="mx-auto mb-8 h-px w-16 bg-gold/50" />

        {/* Mensaje */}
        <p className="mx-auto max-w-sm text-base leading-relaxed text-muted">
          {message}
        </p>

        {/* WhatsApp */}
        <div className="mt-10">
          <a
            href="https://wa.me/5493424368868"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gold/40 px-6 py-3 text-xs font-medium tracking-[0.15em] text-gold uppercase transition-colors hover:bg-gold/10"
          >
            Contactar por WhatsApp
          </a>
        </div>

        {/* Instagram */}
        <p className="mt-6 text-xs text-muted-dark">
          Seguinos en{" "}
          <a
            href="https://www.instagram.com/tatianamartinezestilista.ok"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            @tatianamartinezestilista.ok
          </a>
        </p>
      </div>
    </div>
  );
}
