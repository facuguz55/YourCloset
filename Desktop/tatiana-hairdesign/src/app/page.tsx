import { redirect } from "next/navigation";
import { getMembershipTypes, getSiteConfig } from "@/lib/queries";
import { Hero } from "@/components/public/Hero";
import { AboutSection } from "@/components/public/AboutSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { MembershipsSection } from "@/components/public/MembershipsSection";
import { BranchesSection } from "@/components/public/BranchesSection";
import { GallerySection } from "@/components/public/GallerySection";
import { AcademiaSection } from "@/components/public/AcademiaSection";
import { FranchisesSection } from "@/components/public/FranchisesSection";
import { Footer } from "@/components/public/Footer";

export default async function HomePage() {
  const [siteConfig, memberships] = await Promise.all([
    getSiteConfig(),
    getMembershipTypes(),
  ]);

  if (siteConfig.maintenance_mode === "true") {
    redirect("/maintenance");
  }

  const heroTitle = siteConfig.hero_title ?? "Tatiana Martinez Hair Design";
  const heroSubtitle =
    siteConfig.hero_subtitle ?? "Unimos belleza, formación y crecimiento.";
  const aboutText =
    siteConfig.about_text ??
    "Con más de 20 años de experiencia, Tatiana Martinez es estilista y colorista internacional reconocida en Santa Fe, Argentina.";

  return (
    <main>
      <Hero title={heroTitle} subtitle={heroSubtitle} />
      <AboutSection text={aboutText} />
      <ServicesSection />
      <MembershipsSection memberships={memberships} />
      <BranchesSection />
      <GallerySection />
      <AcademiaSection />
      <FranchisesSection />
      <Footer />
    </main>
  );
}
