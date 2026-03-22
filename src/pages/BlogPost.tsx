import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Markdown from "react-markdown";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { getPost, blogPosts } from "@/data/blog-posts";
import PageViews from "@/components/PageViews";
import NotFound from "./NotFound";
import { ease } from "@/lib/motion";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? "");

  if (!post) return <NotFound />;

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>{post.title} | Siddarth Kumar</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://siddarthkay.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />
      <main className="min-h-screen pt-24 pb-32 px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
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
            <Markdown>{post.content}</Markdown>
          </motion.div>

          {/* Prev / Next */}
          <div className="rule-fade mt-16 mb-12" />
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
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
