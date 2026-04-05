import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import sidkayLogo from "@/assets/sidkay-logo.png";
import sketchInfrastructure from "@/assets/sketch-infrastructure.png";
import sketchEthereum from "@/assets/sketch-ethereum.png";
import sketchDevtools from "@/assets/sketch-devtools.png";
import sketchHardware from "@/assets/sketch-hardware.png";
import sketchServices from "@/assets/sketch-services.png";
import sketchGames from "@/assets/sketch-games.png";
import steamData from "@/data/steam-data.json";
import { makeToolCategories, type ToolCategory } from "@/data/uses-tools";
import PageViews from "@/components/PageViews";
import { ease } from "@/lib/motion";

const toolCategories: ToolCategory[] = makeToolCategories({
  infrastructure: sketchInfrastructure,
  ethereum: sketchEthereum,
  devtools: sketchDevtools,
  hardware: sketchHardware,
  services: sketchServices,
});

const games = steamData.games;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoryBlock({ cat, i }: { cat: ToolCategory; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const id = slugify(cat.category);

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.06, ease }}
      className="relative border-b border-navy/[0.07] py-12"
    >
      {/* Index + category */}
      <div className="flex items-baseline gap-4 mb-8">
        <a href={`#${id}`} className="font-mono text-burnt text-sm font-medium tabular-nums no-underline hover:no-underline">{cat.index}</a>
        <a href={`#${id}`} className="label-mono text-slate/60 no-underline hover:no-underline hover:text-burnt transition-colors">{cat.category}</a>
      </div>

      {/* Content row: list on left, sketch watermark on right (lg only) */}
      <div className="flex items-start gap-8">
        {/* Items list - takes full width on mobile/tablet, constrained on desktop */}
        <div className="flex-1 min-w-0 space-y-1 max-w-2xl">
          {cat.items.map((item) => (
            <motion.div
              key={item.name}
              className="group relative flex gap-4 px-3 py-3.5 rounded-sm cursor-default"
              whileHover="hovered"
              initial="rest"
            >
              <motion.div
                variants={{ rest: { scaleY: 0, opacity: 0 }, hovered: { scaleY: 1, opacity: 1 } }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 top-2 bottom-2 w-[2px] bg-burnt origin-top rounded-full"
              />
              <motion.div
                variants={{ rest: { opacity: 0 }, hovered: { opacity: 1 } }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-navy/[0.03] rounded-sm"
              />
              <motion.div
                className="flex-1 relative"
                variants={{ rest: { x: 0 }, hovered: { x: 5 } }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-baseline gap-3">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-navy text-lg font-medium leading-tight hover:text-burnt transition-colors duration-150 link-underline"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <span className="font-serif text-navy text-lg font-medium leading-tight">{item.name}</span>
                  )}
                </div>
                <p className="font-sans text-slate text-sm leading-relaxed mt-0.5">{item.note}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Sketch watermark - only renders on lg+, sits in the natural right column */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: i * 0.06 + 0.2, ease }}
          className="hidden md:flex flex-shrink-0 w-[160px] lg:w-[200px] xl:w-[240px] h-[160px] lg:h-[200px] xl:h-[240px] items-center justify-center self-center pointer-events-none select-none"
          style={{ opacity: 0.08 }}
        >
          <img
            src={cat.sketch}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-contain"
            style={{ filter: "contrast(1.2)" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function GamesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="currently-playing" className="py-8 md:py-12 px-6 md:px-8 bg-navy/[0.025]">
      <div className="max-w-5xl mx-auto">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-10"
        >
          <a href="#currently-playing" className="font-mono text-burnt text-sm font-medium tabular-nums no-underline hover:no-underline">06</a>
          <a href="#currently-playing" className="label-mono text-slate no-underline hover:no-underline hover:text-burnt transition-colors">Currently Playing</a>
        </motion.div>

        {/* Content row: text + table on left, sketch on right (lg only) */}
        <div className="flex items-start gap-12">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05, ease }}
              className="mb-8 max-w-2xl"
            >
              <h2
                className="font-serif text-navy font-medium leading-[1.05] mb-4"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
              >
                Not everything<br />is infrastructure.
              </h2>
              <p className="font-sans text-slate text-base leading-relaxed">
                I play games to turn my brain off. Mostly single-player stuff
                that I can pick up on the Steam Deck between builds.
              </p>
              <p className="font-mono text-xs text-slate/40 mt-3"># Steam · PC · Steam Deck</p>
            </motion.div>

            {/* Games table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease }}
              className="max-w-2xl"
            >
              <div className="grid grid-cols-[1fr_5rem] gap-x-4 border-t border-navy/[0.1] pt-3 pb-2 mb-1">
                <span className="label-mono text-slate/40">Game</span>
                <span className="label-mono text-slate/40 text-right">Hours</span>
              </div>

              {games.map((game, i) => (
                <motion.div
                  key={game.appid}
                  initial={{ opacity: 0, x: 8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  whileHover="hovered"
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.07, ease }}
                  className="relative grid grid-cols-[1fr_5rem] gap-x-4 py-3.5 border-b border-navy/[0.06]"
                >
                  <motion.div
                    variants={{ rest: { opacity: 0 }, hovered: { opacity: 1 } }}
                    initial="rest"
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 -mx-3 bg-navy/[0.03] rounded-sm pointer-events-none"
                  />
                  <motion.div
                    variants={{ rest: { x: 0 }, hovered: { x: 4 } }}
                    initial="rest"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <a
                      href={"https://store.steampowered.com/app/" + game.appid}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-navy text-base font-medium leading-tight hover:text-burnt transition-colors duration-150 link-underline"
                    >
                      {game.name}
                    </a>
                  </motion.div>
                  <motion.p
                    variants={{ rest: { opacity: 0.6 }, hovered: { opacity: 1 } }}
                    initial="rest"
                    className="font-mono text-sm text-slate text-right self-center"
                  >
                    {game.hours}
                  </motion.p>
                </motion.div>
              ))}

              <p className="font-mono text-[0.65rem] text-slate/30 mt-5">
                Live via Steam API · Updated {new Date(steamData.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </motion.div>
          </div>

          {/* Steam Deck sketch - only on lg+, in natural flow alongside content */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="hidden md:flex flex-shrink-0 w-[180px] lg:w-[220px] xl:w-[280px] h-[180px] lg:h-[220px] xl:h-[280px] items-center justify-center self-center pointer-events-none select-none"
            style={{ opacity: 0.08 }}
          >
            <img
              src={sketchGames}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-full object-contain"
              style={{ filter: "contrast(1.2)" }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default function Uses() {
  useDocumentTitle("Uses | Siddarth Kumar");
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />

      <main>
        {/* Page header */}
        <section className="pt-24 md:pt-32 pb-8 md:pb-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto" ref={heroRef}>

            {/* Masthead bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, ease }}
              className="flex items-center justify-between border-t border-b border-navy/20 py-2 mb-8 md:mb-12"
            >
              <span className="label-mono text-slate">Field Notes</span>
              <span className="label-mono text-slate hidden sm:block">Tools and Workflow</span>
              <span className="flex items-center gap-4">
                <PageViews />
                <span className="label-mono text-burnt">Mar 2026</span>
              </span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-start">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1, ease }}
                  className="label-mono text-burnt mb-5"
                >
                  Hardware · Software · Services
                </motion.p>

                <div className="overflow-hidden mb-4">
                  <motion.h1
                    initial={{ y: "105%" }}
                    animate={heroInView ? { y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.15, ease }}
                    className="font-serif text-navy font-medium leading-[0.92] tracking-[-0.03em]"
                    style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
                  >
                    What I use.
                  </motion.h1>
                </div>

                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={heroInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.42, ease }}
                  className="h-px bg-navy/20 max-w-lg mb-6"
                />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.52, ease }}
                  className="font-serif text-ink text-base md:text-xl leading-[1.65] max-w-[52ch]"
                >
                  A running log of the tools, hardware, and services that make up
                  my daily workflow. Not aspirational, this is what actually runs.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.65, ease }}
                  className="mt-6 md:mt-8"
                >
                  <Link
                    to="/"
                    className="font-mono text-xs uppercase tracking-widest text-slate hover:text-burnt transition-colors duration-200 link-underline"
                  >
                    Back to portfolio
                  </Link>
                </motion.div>
              </div>

              {/* Logo mark - desktop only */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3, ease }}
                className="hidden lg:flex flex-col items-center justify-start pt-4 gap-6"
              >
                <img
                  src={sidkayLogo}
                  alt="Siddarth Kumar mark"
                  className="w-[120px] h-[120px] object-contain opacity-80"
                />
                <div className="flex flex-col items-center gap-3" style={{ writingMode: "vertical-rl" }}>
                  <span className="label-mono text-slate/40 text-[0.6rem]">Field Notes</span>
                  <span className="w-px h-12 bg-navy/10 self-center block" />
                  <span className="label-mono text-slate/40 text-[0.6rem]">Last updated Mar 2026</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="rule-fade mt-8 md:mt-16"
            />
          </div>
        </section>

        {/* Tools catalog */}
        <section className="py-8 md:py-12 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Column labels */}
            <div className="grid grid-cols-[4rem_1fr] gap-4 border-t border-navy/[0.1] pt-3 pb-1 mb-2">
              <span className="label-mono text-slate/40">#</span>
              <span className="label-mono text-slate/40">Category / Tool</span>
            </div>

            {toolCategories.map((cat, i) => (
              <CategoryBlock key={cat.index} cat={cat} i={i} />
            ))}

            
          </div>
        </section>

        {/* Games section */}
        <GamesSection />
      </main>

      <SiteFooter />
    </>
  );
}
