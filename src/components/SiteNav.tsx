import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ease } from "@/lib/motion";

interface NavItem {
  label: string;
  href: string;
  type: "scroll" | "route";
}

const navItems: NavItem[] = [
  { label: "About", href: "#about", type: "scroll" },
  { label: "Work", href: "#work", type: "scroll" },
  { label: "Writing", href: "#writing", type: "scroll" },
  { label: "Uses", href: "/uses", type: "route" },
  { label: "Contact", href: "#contact", type: "scroll" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (item: NavItem) => {
    setMenuOpen(false);
    if (item.type === "route") {
      navigate(item.href);
      return;
    }
    // If not on home page, navigate home first then scroll
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(item.href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    const el = document.querySelector(item.href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Accent strip — thin burnt orange bar at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-burnt" />

      <header
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-parchment/96 backdrop-blur-sm shadow-printed border-b border-navy/[0.07]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-center justify-between h-12">
          {/* Name only — minimal, no logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="font-serif text-navy text-[0.9375rem] font-medium tracking-tight hover:text-burnt transition-colors duration-200"
          >
            Siddarth Kumar
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                className={`nav-link link-underline ${item.type === "route" && location.pathname === item.href ? "text-burnt" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            aria-label="Toggle menu"
            className="md:hidden flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 origin-center ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease }}
              className="md:hidden bg-parchment border-t border-navy/[0.08] px-6 py-6 flex flex-col gap-5 shadow-lg"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                  className="font-sans text-navy text-sm uppercase tracking-widest font-medium hover:text-burnt transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
