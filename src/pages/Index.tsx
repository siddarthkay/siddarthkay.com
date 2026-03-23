import { useDocumentTitle } from "@/lib/useDocumentTitle";
import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import VitalsSection from "@/components/VitalsSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";
import SpotifySection from "@/components/SpotifySection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

export default function Index() {
  useDocumentTitle("Siddarth Kumar | Infrastructure Engineer & DevOps");

  return (
    <>
      {/* Paper grain texture overlay */}
      <div className="paper-grain" aria-hidden="true" />

      <SiteNav />

      <main>
        <HeroSection />
        <AboutSection />
        <VitalsSection />
        <ProjectsSection />
        <BlogSection />
        <SpotifySection />
        <ContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
