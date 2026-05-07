import { MessageCircle } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Membresías", href: "#membresias" },
  { label: "Sucursales", href: "#sucursales" },
  { label: "Academia", href: "#academia" },
  { label: "Franquicias", href: "#franquicias" },
];

export function Footer() {
  return (
    <footer className="border-t border-dark-border bg-darker">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div
              className="mb-3 text-xl font-bold text-gold"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
            >
              Tatiana Martinez
            </div>
            <p className="text-xs tracking-[0.15em] text-muted uppercase mb-4">
              Hair Design
            </p>
            <p className="text-sm leading-relaxed text-muted">
              Unimos belleza, formación y crecimiento. Santa Fe, Argentina.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="mb-4 text-xs font-medium tracking-[0.2em] text-gold/70 uppercase">
              Navegación
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-4 text-xs font-medium tracking-[0.2em] text-gold/70 uppercase">
              Contacto
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.instagram.com/tatianamartinezestilista.ok"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-gold"
              >
                <InstagramIcon className="size-4" />
                @tatianamartinezestilista.ok
              </a>
              <a
                href={`https://wa.me/5493424368868`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-gold"
              >
                <MessageCircle className="size-4" />
                La Rioja 2718 | Centro
              </a>
              <a
                href={`https://wa.me/5493424216359`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-gold"
              >
                <MessageCircle className="size-4" />
                Complejo Miraflores
              </a>
              <a
                href={`https://wa.me/5493424443516`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-gold"
              >
                <MessageCircle className="size-4" />
                Moreno 2599
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-dark-border pt-6 text-center md:flex-row">
          <p className="text-xs text-muted-dark">
            © {new Date().getFullYear()} Tatiana Martinez Hair Design. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-dark">Santa Fe, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
