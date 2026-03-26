import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/motion";

export default function SpotifySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="music" className="py-20 md:py-24 px-6 md:px-8 bg-navy/[0.025]">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[5fr_7fr] gap-12 md:gap-16 items-start">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="space-y-5"
          >
            {/* Small decoration */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-burnt/50" />
              <p className="label-mono text-burnt">Currently playing</p>
            </div>

            <h2
              className="font-serif text-navy font-medium leading-tight group"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            >
              <a href="#music" className="no-underline hover:no-underline">
                What's in<br />the headphones.
                <span className="ml-2 opacity-0 group-hover:opacity-40 transition-opacity text-slate select-none">#</span>
              </a>
            </h2>

            <p className="font-sans text-slate text-base leading-relaxed max-w-[38ch]">
              Long builds need good music. This playlist has been running on the
              build server since 2023. Updated when something earns a spot.
            </p>

            {/* Small monospace aside */}
            <p className="font-mono text-xs text-slate/40 mt-6">
              # Spotify · Playlist · Public
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "3px" }}
              src="https://open.spotify.com/embed/playlist/5PIm1tQyesjWs0CTBZ334A?utm_source=generator&theme=0"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Siddarth Kumar's playlist"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
