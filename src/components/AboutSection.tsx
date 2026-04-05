import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ease } from "@/lib/motion";

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Section label - flush left, number + word */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-14"
        >
          <a href="#about" className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums no-underline hover:no-underline">01</a>
          <a href="#about" className="label-mono text-slate no-underline hover:no-underline hover:text-burnt transition-colors">About</a>
        </motion.div>

        {/* Two-column: heading left, prose right - breaks at md */}
        <div className="grid md:grid-cols-[5fr_7fr] gap-12 md:gap-16 items-start">

          {/* Left: large heading + pull quote */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.05, ease }}
            className="space-y-8"
          >
            <h2 className="font-serif text-navy font-medium leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              The work,<br />plainly<br />stated.
            </h2>

            {/* Pull quote */}
            <blockquote className="border-l-2 border-burnt pl-5">
              <p className="font-serif italic text-slate text-lg leading-relaxed">
                "Get it working first. Make it good later. Momentum matters
                more than perfection."
              </p>
            </blockquote>

            {/* Skill list - printed label style */}
            <div className="pt-2">
              <p className="label-mono text-slate/60 mb-3">Toolchain</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {["Go", "Nix", "Docker", "Ansible", "Terraform", "Jenkins", "React Native", "Nimbus", "Nethermind"].map((skill) => (
                  <span key={skill} className="label-mono text-navy/70">{skill}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: running prose */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="space-y-5 md:pt-1"
          >
            <p className="font-sans text-ink text-lg leading-[1.8] max-w-prose">
              At{" "}
              <a href="https://free.technology" target="_blank" rel="noopener noreferrer" className="text-burnt link-underline">
                IFT
              </a>
              , I look after production deployments and on-call for Ethereum
              light client infrastructure. Nix derivations, nftables firewall
              migrations, benchmarking nimbus-eth1, keeping CI green when Apple
              ships a new Xcode. The kind of work that's invisible when it runs
              well and very visible when it doesn't.
            </p>
            <p className="font-sans text-ink text-lg leading-[1.8] max-w-prose">
              Before this I was at{" "}
              <a href="https://status.im" target="_blank" rel="noopener noreferrer" className="text-burnt link-underline">
                Status
              </a>
              , where I took on the React Native 0.63 to 0.73 upgrade that
              nobody wanted to touch. I also owned the build systems across
              iOS, Android, macOS, Linux, and Windows. Jenkins pipelines,
              reproducible Docker environments, Nix for dependencies, Fastlane
              for releases.
            </p>
            <p className="font-sans text-ink text-lg leading-[1.8] max-w-prose">
              I started out as the first engineer at a small consultancy and
              ended up running it as CTO. Grew the team to 30, shipped Laravel
              sites and React Native apps, set up our first CI pipelines. I
              believe in reproducible builds, open-source tooling, and doing
              things properly rather than quickly.
            </p>
          </motion.div>
        </div>

        <div className="rule-fade mt-20 md:mt-28" />
      </div>
    </section>
  );
}
