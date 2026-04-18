import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Markdown, { type Components } from "react-markdown";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import CodeBlock from "@/components/CodeBlock";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getProject, projects } from "@/data/projects";
import PageViews from "@/components/PageViews";
import SupportButtons from "@/components/SupportButtons";
import NotFound from "./NotFound";
import { ease } from "@/lib/motion";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function HeadingWithAnchor({
  level,
  children,
}: {
  level: 2 | 3;
  children: React.ReactNode;
}) {
  const text = typeof children === "string" ? children : String(children);
  const id = slugify(text);
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className="group">
      <a href={`#${id}`} className="no-underline hover:no-underline">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-40 transition-opacity text-slate select-none">#</span>
      </a>
    </Tag>
  );
}

function Screenshots({ source }: { source: string }) {
  const items = source
    .split("\n")
    .map((line) => {
      const [caption, src] = line.split("|").map((part) => part.trim());
      return caption && src ? { caption, src } : null;
    })
    .filter((x): x is { caption: string; src: string } => x !== null);
  if (items.length === 0) return null;
  return (
    <div className="my-8 -mx-2 sm:mx-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 not-prose">
      {items.map((item) => (
        <figure key={item.src} className="m-0 flex flex-col gap-2">
          <img
            src={item.src}
            alt={item.caption}
            loading="lazy"
            className="w-full h-auto rounded-sm border border-navy/[0.08] bg-navy/[0.02] m-0"
          />
          <figcaption className="label-mono text-slate/60 text-center">
            {item.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function DataTable({ source }: { source: string }) {
  const rows = source
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((row) => row.length > 1);
  if (rows.length < 2) return <pre>{source}</pre>;
  const [header, ...body] = rows;
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-auto max-w-full border-collapse font-mono text-[0.82rem]">
        <thead>
          <tr className="border-b border-navy/25">
            {header.map((cell, i) => (
              <th
                key={i}
                className={
                  "label-mono text-burnt font-semibold px-3 py-2 " +
                  (i === 0 ? "text-left" : "text-right")
                }
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr
              key={ri}
              className={
                "border-b border-navy/[0.06] " +
                (ri % 2 === 0 ? "bg-navy/[0.02]" : "")
              }
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={
                    "px-3 py-2 text-navy " +
                    (ci === 0 ? "text-left text-slate" : "text-right")
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const markdownComponents: Components = {
  h2: ({ children }) => <HeadingWithAnchor level={2}>{children}</HeadingWithAnchor>,
  h3: ({ children }) => <HeadingWithAnchor level={3}>{children}</HeadingWithAnchor>,
  pre: ({ children }) => {
    const child = children as React.ReactElement<{ className?: string; children?: string }>;
    const className = child?.props?.className || "";
    const match = /language-(\w+)/.exec(className);
    const code = String(child?.props?.children || "").replace(/\n$/, "");
    if (match) {
      if (match[1] === "table") {
        return <DataTable source={code} />;
      }
      if (match[1] === "screenshots") {
        return <Screenshots source={code} />;
      }
      return <CodeBlock language={match[1]}>{code}</CodeBlock>;
    }
    return <pre>{children}</pre>;
  },
  code: ({ className, children }) => {
    if (className) return <code className={className}>{children}</code>;
    const content = String(children);
    return <code>{content}</code>;
  },
};

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getProject(slug ?? "");

  useDocumentTitle(project ? `${project.name} | Siddarth Kumar` : "Siddarth Kumar");

  if (!project || !project.content) return <NotFound />;

  const withPages = projects.filter((p) => p.slug && p.content);
  const currentIndex = withPages.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? withPages[currentIndex - 1] : null;
  const nextProject =
    currentIndex !== -1 && currentIndex < withPages.length - 1
      ? withPages[currentIndex + 1]
      : null;

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />
      <main className="min-h-screen pt-24 pb-32 px-6 md:px-8">
        <article className="max-w-2xl mx-auto">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="mb-14"
          >
            <Link
              to="/#projects"
              className="font-mono text-xs uppercase tracking-widest text-slate hover:text-burnt transition-colors"
            >
              ← All projects
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Meta row */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="label-mono text-burnt">{project.year}</span>
              {project.status && (
                <>
                  <span className="label-mono text-slate/40">·</span>
                  <span className="label-mono text-slate">{project.status}</span>
                </>
              )}
              <span className="label-mono text-slate/40">·</span>
              <PageViews />
            </div>

            <h1 className="font-serif text-navy text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              {project.name}
            </h1>

            {project.tagline && (
              <p className="font-serif italic text-slate text-xl leading-relaxed mb-8">
                {project.tagline}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="label-mono text-slate border border-navy/[0.12] px-2.5 py-1 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Primary links */}
            <div className="flex flex-wrap gap-3 mb-10">
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest text-navy hover:text-burnt border border-navy/20 hover:border-burnt/40 px-3 py-2 rounded-sm transition-colors"
                >
                  Source →
                </a>
              )}
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest text-navy hover:text-burnt border border-navy/20 hover:border-burnt/40 px-3 py-2 rounded-sm transition-colors"
                >
                  Visit →
                </a>
              )}
            </div>

            <div className="rule-fade mb-12" />
          </motion.div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="prose-blog"
          >
            <Markdown components={markdownComponents}>{project.content}</Markdown>
          </motion.div>

          {/* Support */}
          <div className="rule-fade mt-16 mb-10" />
          <SupportButtons variant="light" />

          {/* Prev / Next */}
          {(prevProject || nextProject) && (
            <>
              <div className="rule-fade mt-12 mb-12" />
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                {prevProject && (
                  <Link
                    to={`/projects/${prevProject.slug}`}
                    className="group flex flex-col gap-1 max-w-xs"
                  >
                    <span className="label-mono text-slate group-hover:text-burnt transition-colors">
                      ← Previous
                    </span>
                    <span className="font-serif text-navy text-base leading-snug group-hover:text-burnt transition-colors">
                      {prevProject.name}
                    </span>
                  </Link>
                )}
                {nextProject && (
                  <Link
                    to={`/projects/${nextProject.slug}`}
                    className="group flex flex-col gap-1 max-w-xs text-right sm:items-end"
                  >
                    <span className="label-mono text-slate group-hover:text-burnt transition-colors">
                      Next →
                    </span>
                    <span className="font-serif text-navy text-base leading-snug group-hover:text-burnt transition-colors">
                      {nextProject.name}
                    </span>
                  </Link>
                )}
              </div>
            </>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
