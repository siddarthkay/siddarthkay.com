import { Helmet } from "react-helmet-async";
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
  return (
    <>
      <Helmet>
        <title>Siddarth Kumar | Infrastructure Engineer &amp; DevOps</title>
        <meta name="description" content="Siddarth Kumar builds and maintains the infrastructure behind decentralized software. CI/CD pipelines, multi-platform build systems, and Ethereum validator nodes." />
        <meta property="og:title" content="Siddarth Kumar | Infrastructure Engineer & DevOps" />
        <meta property="og:description" content="CI/CD pipelines, multi-platform build systems, and Ethereum validator infrastructure." />
        <meta property="og:url" content="https://siddarthkay.com/" />
      </Helmet>

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
