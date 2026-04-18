import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ease } from "@/lib/motion";
import { projects, type Project } from "@/data/projects";

function ProjectCard({ project, i }: { project: Project; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const hasInternalPage = !!(project.slug && project.content);
  const hasLink = hasInternalPage || !!project.href;

  const body = (
    <>
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
            {project.name}
          </h3>
          {hasLink && (
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

      {/* Year - right column on desktop */}
      <div className="hidden md:flex items-start justify-end pt-1">
        <span className="label-mono text-slate/40">{project.year}</span>
      </div>
    </>
  );

  const rowClass =
    "group grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr_9rem] gap-6 md:gap-10 py-9 border-b border-navy/[0.07] hover:bg-navy/[0.018] transition-colors duration-200 -mx-4 px-4 rounded-sm no-underline hover:no-underline";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.07, ease }}
    >
      {hasInternalPage ? (
        <Link to={`/projects/${project.slug}`} className={`${rowClass} cursor-pointer`}>
          {body}
        </Link>
      ) : project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rowClass} cursor-pointer`}
        >
          {body}
        </a>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </motion.div>
  );
}

export default function ProjectsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="projects" className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 6 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-14"
        >
          <a href="#projects" className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums no-underline hover:no-underline">04</a>
          <a href="#projects" className="label-mono text-slate no-underline hover:no-underline hover:text-burnt transition-colors">Projects</a>
        </motion.div>

        {/* Column labels */}
        <div className="grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr_9rem] gap-6 md:gap-10 border-t border-navy/[0.1] pt-3 pb-1">
          <span className="label-mono text-slate/40">#</span>
          <span className="label-mono text-slate/40">Project</span>
          <span className="label-mono text-slate/40 hidden md:block text-right">Year</span>
        </div>

        {projects.map((project, i) => (
          <ProjectCard key={project.index} project={project} i={i} />
        ))}

        <div className="rule-fade mt-20 md:mt-28" />
      </div>
    </section>
  );
}
