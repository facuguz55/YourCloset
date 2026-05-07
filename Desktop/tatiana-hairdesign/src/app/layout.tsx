import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-dark text-foreground">
        {children}
      </body>
    </html>
  );
}
