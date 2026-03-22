import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ease } from "@/lib/motion";

const GCAL_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2HZIJ1T32Obs4qxIV0_o0oVGxt2Jh_yVJm66Hcj88b0v4VKqx4mdco_iqDJRfPhYGDZXhu1zrG?gv=true";

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [showCal, setShowCal] = useState(false);

  return (
    <>
      <section id="contact" ref={ref} className="py-24 md:py-36 px-6 md:px-8 bg-navy">
        <div className="max-w-5xl mx-auto">

          {/* Section number label */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease }}
            className="flex items-baseline gap-4 mb-14"
          >
            <span className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums">05</span>
            <span className="label-mono text-parchment/40">Contact</span>
          </motion.div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              <h2
                className="font-serif text-parchment font-medium leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
              >
                My time<br />is limited.
              </h2>
              <p className="font-sans text-parchment/50 text-sm leading-relaxed mt-5 max-w-[28ch]">
                I'm currently heads-down on a few things. Book a slot and I'll review it. No guarantees, but I do read every request.
              </p>
              <p className="font-mono text-[0.65rem] text-parchment/25 mt-4 uppercase tracking-widest">
                Serious inquiries only
              </p>
            </motion.div>

            {/* Links + calendar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="space-y-10"
            >
              {/* Book a call */}
              <div>
                <p className="label-mono text-parchment/30 mb-4">Request a slot · I'll confirm if I can make it work</p>
                <button
                  onClick={() => {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      window.location.href = GCAL_URL;
                    } else {
                      setShowCal(true);
                    }
                  }}
                  className="font-mono text-xs uppercase tracking-widest px-6 py-3 bg-burnt text-parchment border border-burnt hover:bg-burnt/80 transition-all duration-200 rounded-sm cursor-pointer"
                >
                  Book a call
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-parchment/10" />

              {/* Links */}
              <div className="space-y-4">
                {[
                  { label: "Email", href: "mailto:hello@siddarthkay.com", text: "hello@siddarthkay.com" },
                  { label: "GitHub", href: "https://github.com/siddarthkay", text: "github.com/siddarthkay", external: true },
                  { label: "Twitter", href: "https://twitter.com/siddarthkay", text: "@siddarthkay", external: true },
                  { label: "LinkedIn", href: "https://linkedin.com/in/siddarth-kumar", text: "linkedin.com/in/siddarth-kumar", external: true },
                ].map(({ label, href, text, external }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="label-mono text-parchment/30 w-16">{label}</span>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="font-sans text-parchment/80 text-base hover:text-burnt transition-colors duration-200 link-underline"
                      style={{ "--link-underline-color": "hsl(25 67% 50%)" } as React.CSSProperties}
                    >
                      {text}
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Calendar modal */}
      <AnimatePresence>
        {showCal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/80 backdrop-blur-sm"
            onClick={() => setShowCal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease }}
              className="relative w-[96vw] sm:w-[90vw] max-w-[900px] h-[92vh] sm:h-[85vh] bg-white rounded-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCal(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-slate hover:text-navy transition-colors text-lg font-mono"
              >
                &times;
              </button>
              <iframe
                src={GCAL_URL}
                className="w-full h-full border-0"
                title="Book a call"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
