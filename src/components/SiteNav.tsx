import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ease } from "@/lib/motion";
import SearchDialog from "./SearchDialog";

interface NavItem {
  label: string;
  href: string;
  type: "scroll" | "route";
}

const navItems: NavItem[] = [
  { label: "About", href: "#about", type: "scroll" },
  { label: "Work", href: "#work", type: "scroll" },
  { label: "Writing", href: "/blog", type: "route" },
  { label: "Uses", href: "/uses", type: "route" },
  { label: "Contact", href: "#contact", type: "scroll" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => { clearTimeout(scrollTimerRef.current); };
  }, []);

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
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
      {/* Accent strip - thin burnt orange bar at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-burnt" />

      <header
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-parchment/96 backdrop-blur-sm shadow-printed border-b border-navy/[0.07]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-center justify-between h-12">
          {/* Name only - minimal, no logo */}
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="font-serif text-navy text-[0.9375rem] font-medium tracking-tight hover:text-burnt transition-colors duration-200"
          >
            Siddarth Kumar
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              item.type === "route" ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`nav-link link-underline ${location.pathname === item.href ? "text-burnt" : ""}`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                  className="nav-link link-underline"
                >
                  {item.label}
                </a>
              )
            )}
            <button
              type="button"
              aria-label="Search posts"
              title="Search (⌘K)"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 font-mono text-[0.7rem] text-slate hover:text-burnt border border-navy/15 hover:border-burnt/40 px-2 py-1 rounded-sm transition-colors"
            >
              <Search className="h-3 w-3" />
              <kbd className="text-[0.6rem] opacity-70">⌘K</kbd>
            </button>
          </nav>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              aria-label="Search posts"
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-navy hover:text-burnt transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
            aria-label="Toggle menu"
            className="flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 origin-center ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-navy transition-all duration-200 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
          </div>
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
              {navItems.map((item) =>
                item.type === "route" ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="font-sans text-navy text-sm uppercase tracking-widest font-medium hover:text-burnt transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(item); }}
                    className="font-sans text-navy text-sm uppercase tracking-widest font-medium hover:text-burnt transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
