import Image from "next/image";

interface GallerySectionProps {
  images?: Array<{ url: string; alt?: string }>;
}

const PLACEHOLDER_IMAGES = Array.from({ length: 9 }, (_, i) => ({
  url: "",
  alt: `Trabajo de Tatiana Martinez ${i + 1}`,
}));

export function GallerySection({ images }: GallerySectionProps) {
  const items = (images?.length ?? 0) > 0 ? images! : PLACEHOLDER_IMAGES;

  return (
    <section id="galeria" className="bg-darker py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-xs font-medium tracking-[0.25em] text-gold uppercase">
              Portfolio
            </span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
          <h2
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Nuestros <span className="italic text-gold">trabajos</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg bg-dark-alt"
            >
              {item.url ? (
                <Image
                  src={item.url}
                  alt={item.alt ?? ""}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center border border-dark-border">
                  <div
                    className="text-2xl text-gold/10"
                    style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                  >
                    TM
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Instagram */}
        <div className="mt-10 text-center">
          <a
            href="https://www.instagram.com/tatianamartinezestilista.ok"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
          >
            Ver más en Instagram @tatianamartinezestilista.ok
          </a>
        </div>
      </div>
    </section>
  );
}
