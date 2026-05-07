import { Metadata } from "next";
import { login } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Acceso — Tatiana Martinez Hair Design",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-darker px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mb-1 text-2xl font-bold italic text-gold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tatiana Martinez
          </div>
          <div className="text-xs tracking-[0.2em] text-muted uppercase">
            Panel de administración
          </div>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-dark-border bg-dark-card p-7">
          <h1
            className="mb-6 text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Iniciar sesión
          </h1>

          {error && (
            <div className="mb-5 rounded border border-red-900/50 bg-red-950/30 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tatiana@ejemplo.com"
                className="w-full rounded border border-dark-border bg-dark-alt px-3 py-2.5 text-sm text-foreground placeholder-muted-dark outline-none transition-colors focus:border-gold/60 focus:ring-1 focus:ring-gold/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded border border-dark-border bg-dark-alt px-3 py-2.5 text-sm text-foreground placeholder-muted-dark outline-none transition-colors focus:border-gold/60 focus:ring-1 focus:ring-gold/20"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded border border-gold bg-gold py-3 text-sm font-medium tracking-wide text-darker transition-colors hover:bg-gold-dark hover:border-gold-dark"
            >
              Ingresar
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-dark">
          Acceso restringido al equipo de Tatiana Martinez.
        </p>
      </div>
    </div>
  );
}
