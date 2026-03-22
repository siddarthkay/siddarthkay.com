import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ease } from "@/lib/motion";

interface Post {
  date: string;
  slug: string;
  title: string;
  excerpt: string;
}

const posts: Post[] = [
  {
    date: "Jun 2026",
    slug: "android-seccomp-epoll-crash",
    title: "A Kernel Syscall Was Killing Our Android App on x86_64",
    excerpt: "The app worked on ARM, worked on x86, and crashed instantly on x86_64 emulators. Three months to find two Go libraries making raw epoll_wait calls that Android's seccomp filter blocked.",
  },
  {
    date: "Jun 2026",
    slug: "ios-build-fails-xcodebuild-not-xcode",
    title: "Six Months of Broken iOS Builds, Fixed by One Environment Variable",
    excerpt: "Our app compiled in Xcode but failed via xcodebuild. For half a year nobody could figure out why. The fix was a single line in the Podfile.",
  },
  {
    date: "Mar 2026",
    slug: "og-image-memory-leak-nextjs",
    title: "A Single Config Line Was Leaking 1.8GB in Our Next.js App",
    excerpt: "How a copy-pasted Edge runtime directive caused OG image generation to eat 4.4GB of memory in three minutes.",
  },
  {
    date: "May 2026",
    slug: "react-native-upgrade-status-mobile",
    title: "Upgrading React Native from 0.63 to 0.73 in a Production App",
    excerpt: "A year-long incremental upgrade across five major versions in Status, a ClojureScript app with Go bridges, nix builds, and a full Java-to-Kotlin migration along the way.",
  },
];

export default function BlogSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="writing" className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Section label */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 6 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-14"
        >
          <span className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums">04</span>
          <span className="label-mono text-slate">Writing</span>
        </motion.div>

        {/* Heading + intro side by side */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-20 mb-14 items-end">
          <motion.h2
            initial={{ opacity: 0, x: -8 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="font-serif text-navy font-medium leading-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
          >
            From the<br />notebook.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.18, ease }}
            className="font-sans text-slate text-base leading-relaxed"
          >
            Notes on build systems, Ethereum infrastructure, and the
            occasional debugging rabbit hole. Written when something is worth
            writing down.
          </motion.p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[5rem_1fr] md:grid-cols-[6rem_1fr] gap-4 border-t border-b border-navy/[0.1] py-2">
          <span className="label-mono text-slate/50">Date</span>
          <span className="label-mono text-slate/50">Entry</span>
        </div>

        {posts.map((post, i) => (
          <PostRow key={post.slug} post={post} i={i} />
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          className="mt-8 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-burnt/40" />
          <Link
            to="/blog"
            className="font-mono text-xs uppercase tracking-widest text-burnt link-underline hover:text-burnt/80 transition-colors"
          >
            View all posts
          </Link>
        </motion.div>

        <div className="rule-fade mt-20 md:mt-28" />
      </div>
    </section>
  );
}

function PostRow({ post, i }: { post: Post; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: i * 0.07, ease }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="grid grid-cols-[5rem_1fr] md:grid-cols-[6rem_1fr] gap-4 py-5 border-b border-navy/[0.06] group hover:bg-navy/[0.02] transition-colors duration-150 -mx-4 px-4 rounded-sm block"
      >
        <span className="label-mono text-slate mt-0.5 group-hover:text-burnt transition-colors duration-150">
          {post.date}
        </span>
        <div>
          <h3 className="font-serif text-navy text-lg md:text-xl font-medium leading-snug group-hover:text-burnt transition-colors duration-200">
            {post.title}
          </h3>
          <p className="font-sans text-slate text-sm leading-relaxed mt-1 max-w-prose">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
