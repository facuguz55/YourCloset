import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tatiana Martinez Hair Design | Santa Fe, Argentina",
    template: "%s | Tatiana Martinez Hair Design",
  },
  description:
    "Salón de peluquería y estilismo de alta gama en Santa Fe. Más de 20 años de experiencia. Servicios de coloración, tratamientos capilares, membresías y más.",
  keywords: [
    "peluquería Santa Fe",
    "estilista Santa Fe",
    "coloración capilar",
    "keratina Santa Fe",
    "membresías peluquería",
    "Tatiana Martinez",
  ],
  authors: [{ name: "Tatiana Martinez Hair Design" }],
  openGraph: {
    title: "Tatiana Martinez Hair Design",
    description:
      "Unimos belleza, formación y crecimiento. Salón de alta gama en Santa Fe, Argentina.",
    url: "https://tatianamartinez.com.ar",
    siteName: "Tatiana Martinez Hair Design",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tatiana Martinez Hair Design",
    description:
      "Unimos belleza, formación y crecimiento. Salón de alta gama en Santa Fe, Argentina.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-dark text-foreground">
        {children}
      </body>
    </html>
  );
}
