import { motion } from "framer-motion";
import sidkayLogo from "@/assets/sidkay-logo.png";
import PageViews from "@/components/PageViews";
import { ease } from "@/lib/motion";

export default function HeroSection() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 pb-20 px-6 md:px-8 overflow-hidden">

      {/* ── Masthead row ── */}
      <div className="max-w-5xl mx-auto w-full">

        {/* Publication-style masthead bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between border-t border-b border-navy/20 py-2 mb-10 mt-6 md:mt-10"
        >
          <span className="label-mono text-slate">Vol. XII · Est. 2014</span>
          <span className="label-mono text-slate hidden sm:block">Infrastructure Engineering</span>
          <span className="flex items-center gap-4">
            <PageViews />
            <span className="label-mono text-burnt">Currently heads-down · Requests considered</span>
          </span>
        </motion.div>

        {/* ── Main hero grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start">

          {/* Left: name + content — full width on mobile */}
          <div>
            {/* Eyebrow label */}
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="label-mono text-burnt mb-5"
            >
              DevOps · CI/CD Pipelines · Ethereum Infrastructure
            </motion.p>

            {/* Name — oversized, editorial weight */}
            <h1 className="font-serif text-navy font-medium leading-[0.95] tracking-[-0.03em]"
                style={{ fontSize: "clamp(4rem, 10vw, 8.5rem)" }}>
              <div className="overflow-hidden pt-3 mb-6">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease }}
                  className="block"
                >
                  Siddarth
                </motion.span>
              </div>
              <div className="overflow-hidden pt-3 mb-10">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.22, ease }}
                  className="block"
                >
                  Kumar<span className="text-burnt">.</span>
                </motion.span>
              </div>
            </h1>

            {/* Ruled separator + intro */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.45, ease }}
              className="h-px bg-navy/20 max-w-lg mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease }}
              className="font-serif text-ink text-xl md:text-[1.35rem] leading-[1.65] max-w-[52ch]"
            >
              I build and maintain the infrastructure behind decentralized
              software: CI/CD pipelines, multi-platform build systems, and
              Ethereum validator nodes. Currently at{" "}
              <a
                href="https://free.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="text-burnt link-underline"
              >
                IFT
              </a>
              , previously shipping across mobile, desktop, and blockchain.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll("#work");
                }}
                className="font-mono text-xs uppercase tracking-widest px-6 py-3 bg-navy text-parchment border border-navy hover:bg-burnt hover:border-burnt transition-all duration-200 rounded-sm inline-block"
              >
                View Work
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll("#contact");
                }}
                className="font-mono text-xs uppercase tracking-widest px-6 py-3 bg-transparent text-navy border border-navy/40 hover:border-navy transition-all duration-200 rounded-sm inline-block"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* Right: SK logo — desktop only, large editorial mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          className="hidden md:flex flex-col items-center justify-start pt-4 gap-6"
        >
            <img
              src={sidkayLogo}
              alt="Siddarth Kumar mark"
              className="w-[140px] h-[140px] object-contain opacity-90"
            />
            <div
              className="flex flex-col items-center gap-3"
              style={{ writingMode: "vertical-rl" }}
            >
              <span className="label-mono text-slate/50 text-[0.6rem]">siddarthkay.com</span>
              <span className="w-px h-12 bg-navy/10 self-center block" />
              <span className="label-mono text-slate/50 text-[0.6rem]">KK · Remote</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom rule */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="rule-fade mt-20 md:mt-28"
        />
      </div>
    </section>
  );
}
