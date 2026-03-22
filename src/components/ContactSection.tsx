import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.2, 0, 0, 1] as const;

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const calendarRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const existingLink = document.getElementById("gcal-css");
    if (!existingLink) {
      const link = document.createElement("link");
      link.id = "gcal-css";
      link.rel = "stylesheet";
      link.href = "https://calendar.google.com/calendar/scheduling-button-script.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById("gcal-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "gcal-script";
      script.src = "https://calendar.google.com/calendar/scheduling-button-script.js";
      script.async = true;
      script.onload = () => {
        if (calendarRef.current && (window as any).calendar?.schedulingButton) {
          (window as any).calendar.schedulingButton.load({
            url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2HZIJ1T32Obs4qxIV0_o0oVGxt2Jh_yVJm66Hcj88b0v4VKqx4mdco_iqDJRfPhYGDZXhu1zrG?gv=true",
            color: "#1a2744",
            label: "Book a call",
            target: calendarRef.current,
          });
        }
      };
      document.body.appendChild(script);
    } else {
      setTimeout(() => {
        if (calendarRef.current && (window as any).calendar?.schedulingButton) {
          (window as any).calendar.schedulingButton.load({
            url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2HZIJ1T32Obs4qxIV0_o0oVGxt2Jh_yVJm66Hcj88b0v4VKqx4mdco_iqDJRfPhYGDZXhu1zrG?gv=true",
            color: "#1a2744",
            label: "Book a call",
            target: calendarRef.current,
          });
        }
      }, 100);
    }
  }, []);

  return (
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
              <span ref={calendarRef} />
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
  );
}
