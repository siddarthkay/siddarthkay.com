import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ease } from "@/lib/motion";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />

      <main className="flex-1 flex flex-col justify-center px-6 md:px-8">
        <div className="max-w-5xl mx-auto w-full">

          {/* Masthead bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease }}
            className="flex items-center justify-between border-t border-b border-navy/20 py-2 mb-8"
          >
            <span className="label-mono text-slate">Error Report</span>
            <span className="label-mono text-burnt">Status: 404</span>
          </motion.div>

          <div className="grid md:grid-cols-[5fr_7fr] gap-8 md:gap-16 items-start">

            {/* Left: big 404 */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease }}
                className="label-mono text-burnt mb-4"
              >
                Page Not Found
              </motion.p>

              <div className="overflow-hidden pt-2 mb-4">
                <motion.p
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease }}
                  className="font-serif text-navy font-medium leading-[0.95] tracking-[-0.03em]"
                  style={{ fontSize: "clamp(5rem, 15vw, 10rem)" }}
                >
                  404<span className="text-burnt">.</span>
                </motion.p>
              </div>

              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.45, ease }}
                className="h-px bg-navy/20 max-w-lg"
              />
            </div>

            {/* Right: explanation + links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="space-y-6 md:pt-6"
            >
              <p className="font-serif text-ink text-xl leading-[1.65] max-w-prose">
                Whatever you were looking for isn't here. It may have been moved,
                removed, or never existed in the first place.
              </p>

              <div className="space-y-3">
                <p className="label-mono text-slate/60 mb-2">Try one of these</p>
                {[
                  { to: "/", label: "Home", desc: "Back to the beginning" },
                  { to: "/blog", label: "Blog", desc: "All posts" },
                  { to: "/uses", label: "Uses", desc: "Tools and workflow" },
                ].map(({ to, label, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-baseline gap-4 no-underline"
                  >
                    <span className="font-mono text-burnt text-sm font-medium w-12">
                      {label}
                    </span>
                    <span className="font-sans text-slate text-base group-hover:text-burnt transition-colors duration-200">
                      {desc}
                    </span>
                  </Link>
                ))}
              </div>

              <p className="font-mono text-[0.65rem] text-slate/30 uppercase tracking-widest">
                If you think this is a mistake, let me know
              </p>
            </motion.div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
