import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/motion";

interface Project {
  index: string;
  name: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
}

const projects: Project[] = [
  {
    index: "01",
    name: "IFT: DevOps Engineering",
    year: "2024–Now",
    description:
      "Production deployments, on-call rotations, and build infrastructure for Ethereum light clients. Built nimbus-eth1 benchmarking infra from scratch, migrated fleets from iptables to nftables, and lead macOS/Xcode upgrades across CI.",
    tags: ["Nix", "Docker", "nftables", "Nimbus", "CI/CD"],
    href: "https://free.technology",
  },
  {
    index: "02",
    name: "Status: React Native & Build Systems",
    year: "2022–2024",
    description:
      "Led the React Native 0.63→0.73 upgrade for a decentralised messaging app nobody else would touch. Built local device pairing, moved QR generation to Go backend, and owned CI/CD across iOS, Android, and desktop.",
    tags: ["React Native", "ClojureScript", "Jenkins", "Qt", "Fastlane", "Nix"],
    href: "https://status.im",
  },
  {
    index: "03",
    name: "Source Elements: Product Engineering",
    year: "2021–2022",
    description:
      "Worked directly with the CEO to build a new-generation dashboard in Vue 2. Shipped Dark Mode and coordinated API changes with the backend team.",
    tags: ["Vue 2", "APIs", "Dashboard"],
  },
  {
    index: "04",
    name: "Centillion: Founding → CTO",
    year: "2016–2020",
    description:
      "First technical hire. Grew the team from 1 to 30. Built core products, set up CI pipelines in Bitbucket/GitLab, shipped 10+ Laravel sites and complex mobile apps in React Native and Xamarin. Trained 300+ engineering students.",
    tags: ["React Native", "Laravel", "Docker", "Drupal", "APIGEE"],
  },
];

function ProjectCard({ project, i }: { project: Project; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.07, ease }}
      className="group grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr_9rem] gap-6 md:gap-10 py-9 border-b border-navy/[0.07] hover:bg-navy/[0.018] transition-colors duration-200 -mx-4 px-4 rounded-sm cursor-pointer"
    >
      {/* Index */}
      <div className="pt-1">
        <span className="font-mono text-burnt text-sm font-medium">{project.index}</span>
      </div>

      {/* Main */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3
            className="font-serif text-navy font-medium leading-tight group-hover:text-burnt transition-colors duration-200"
            style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
          >
            {project.href ? (
              <a href={project.href} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            ) : project.name}
          </h3>
          {project.href && (
            <span className="flex-shrink-0 mt-1 font-mono text-base text-slate/40 group-hover:text-burnt group-hover:translate-x-1 transition-all duration-200">→</span>
          )}
        </div>

        <p className="font-sans text-slate text-base leading-relaxed max-w-2xl mb-4">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {project.tags.map((tag) => (
            <span key={tag} className="font-mono text-[0.65rem] text-slate/60 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Year — right column on desktop */}
      <div className="hidden md:flex items-start justify-end pt-1">
        <span className="label-mono text-slate/40">{project.year}</span>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="work" className="py-24 md:py-32 px-6 md:px-8 bg-navy/[0.02]">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 6 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-14"
        >
          <span className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums">03</span>
          <span className="label-mono text-slate">Selected Work</span>
        </motion.div>

        {/* Column labels */}
        <div className="grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr_9rem] gap-6 md:gap-10 border-t border-navy/[0.1] pt-3 pb-1">
          <span className="label-mono text-slate/40">#</span>
          <span className="label-mono text-slate/40">Project</span>
          <span className="label-mono text-slate/40 hidden md:block text-right">Period</span>
        </div>

        {projects.map((project, i) => (
          <ProjectCard key={project.index} project={project} i={i} />
        ))}

        <div className="rule-fade mt-20 md:mt-28" />
      </div>
    </section>
  );
}
