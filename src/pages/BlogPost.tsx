import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Markdown, { type Components } from "react-markdown";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import CodeBlock from "@/components/CodeBlock";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getPost, blogPosts } from "@/data/blog-posts";
import PageViews from "@/components/PageViews";
import LikeButton from "@/components/LikeButton";
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
  const text = typeof children === "string"
    ? children
    : String(children);
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
      return <CodeBlock language={match[1]}>{code}</CodeBlock>;
    }
    return <pre>{children}</pre>;
  },
  code: ({ className, children }) => {
    // Block code is handled by `pre` above; only customize inline code here.
    if (className) return <code className={className}>{children}</code>;
    const content = String(children);
    // Diff-stat pills, e.g. `+761` or `-8871`
    const diff = /^([+\-])(\d[\d,]*)$/.exec(content);
    if (diff) {
      const [, sign, num] = diff;
      const isAdd = sign === "+";
      return (
        <span
          className={
            "inline-flex items-baseline font-mono text-[0.85em] px-1.5 py-0.5 rounded-sm " +
            (isAdd
              ? "bg-[#dafbe1] text-[#1a7f37]"
              : "bg-[#ffebe9] text-[#cf222e]")
          }
        >
          {sign}
          {num}
        </span>
      );
    }
    return <code>{content}</code>;
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? "");

  useDocumentTitle(post ? `${post.title} | Siddarth Kumar` : "Siddarth Kumar");

  if (!post) return <NotFound />;

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />
      <main className="min-h-screen pt-24 pb-32 px-6 md:px-8">
        {/* Sticky like button - desktop sidebar */}
        <div className="hidden lg:block fixed left-[calc(50%-420px)] top-1/2 -translate-y-1/2 z-40">
          <LikeButton slug={post.slug} layout="vertical" />
        </div>

        {/* Sticky like button - mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-parchment/95 backdrop-blur-sm border-t border-navy/[0.07] px-6 py-3">
          <LikeButton slug={post.slug} layout="horizontal" />
        </div>

        <article className="max-w-2xl mx-auto">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="mb-14"
          >
            <Link
              to="/blog"
              className="font-mono text-xs uppercase tracking-widest text-slate hover:text-burnt transition-colors"
            >
              ← All posts
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Meta row */}
            <div className="flex items-center gap-4 mb-6">
              <span className="label-mono text-burnt">{post.date}</span>
              <span className="label-mono text-slate/40">·</span>
              <span className="label-mono text-slate">{post.readTime}</span>
              <span className="label-mono text-slate/40">·</span>
              <PageViews />
            </div>

            <h1 className="font-serif text-navy text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              {post.title}
            </h1>

            <p className="font-serif italic text-slate text-xl leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-10">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="label-mono text-slate border border-navy/[0.12] px-2.5 py-1 rounded-sm"
                >
                  {tag}
                </span>
              ))}
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
            <Markdown components={markdownComponents}>{post.content}</Markdown>
          </motion.div>

          {/* Support */}
          <div className="rule-fade mt-16 mb-10" />
          <SupportButtons variant="light" />

          {/* Prev / Next */}
          <div className="rule-fade mt-12 mb-12" />
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            {prevPost && (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="group flex flex-col gap-1 max-w-xs"
              >
                <span className="label-mono text-slate group-hover:text-burnt transition-colors">
                  ← Previous
                </span>
                <span className="font-serif text-navy text-base leading-snug group-hover:text-burnt transition-colors">
                  {prevPost.title}
                </span>
              </Link>
            )}
            {nextPost && (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group flex flex-col gap-1 max-w-xs text-right sm:items-end"
              >
                <span className="label-mono text-slate group-hover:text-burnt transition-colors">
                  Next →
                </span>
                <span className="font-serif text-navy text-base leading-snug group-hover:text-burnt transition-colors">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
