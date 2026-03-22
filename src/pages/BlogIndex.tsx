import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/data/blog-posts";
import PageViews from "@/components/PageViews";
import { ease } from "@/lib/motion";

export default function BlogIndex() {
  return (
    <>
      <Helmet>
        <title>Blog | Siddarth Kumar</title>
        <meta name="description" content="Writing on CI/CD pipelines, infrastructure engineering, Ethereum nodes, and DevOps." />
        <meta property="og:title" content="Blog | Siddarth Kumar" />
        <meta property="og:description" content="Writing on CI/CD pipelines, infrastructure engineering, Ethereum nodes, and DevOps." />
        <meta property="og:url" content="https://siddarthkay.com/blog" />
      </Helmet>

      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />
      <main className="min-h-screen pt-24 pb-32 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="mb-14"
          >
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-widest text-slate hover:text-burnt transition-colors"
            >
              ← Back home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-2"
          >
            <div className="flex items-center gap-4 mb-3">
              <p className="label-mono text-burnt">Writing</p>
              <PageViews />
            </div>
            <h1 className="font-serif text-navy text-4xl md:text-5xl font-medium">
              All posts.
            </h1>
            <p className="font-sans text-slate text-lg mt-4 max-w-prose">
              Notes on infrastructure, build systems, Ethereum, and the occasional rabbit hole.
            </p>
          </motion.div>

          {/* Table header */}
          <div className="mt-12 grid grid-cols-[5rem_1fr] md:grid-cols-[7rem_1fr_6rem] gap-4 border-t border-b border-navy/[0.1] py-2">
            <span className="label-mono text-slate">Date</span>
            <span className="label-mono text-slate">Entry</span>
            <span className="label-mono text-slate hidden md:block text-right">Read time</span>
          </div>

          {blogPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="grid grid-cols-[5rem_1fr] md:grid-cols-[7rem_1fr_6rem] gap-4 py-5 border-b border-navy/[0.06] group hover:bg-navy/[0.02] transition-colors duration-150 -mx-4 px-4 rounded-sm block"
              >
                <span className="label-mono text-slate mt-0.5 group-hover:text-burnt transition-colors duration-150">
                  {post.date.split(" ")[0].slice(0, 3)} {post.date.split(" ")[1]}
                </span>
                <div>
                  <h2 className="font-serif text-navy text-lg md:text-xl font-medium leading-snug group-hover:text-burnt transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="font-sans text-slate text-sm leading-relaxed mt-1 max-w-prose">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="label-mono text-slate/60 text-[0.6rem]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="label-mono text-slate/50 text-right hidden md:block mt-0.5">
                  {post.readTime}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
