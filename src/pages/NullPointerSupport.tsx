import { motion } from "framer-motion";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ease } from "@/lib/motion";

export default function NullPointerSupport() {
  useDocumentTitle("null-pointer Support | Siddarth Kumar");

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <SiteNav />
      <main className="min-h-screen pt-24 pb-32 px-6 md:px-8">
        <article className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="label-mono text-burnt">null-pointer</span>
            </div>

            <h1 className="font-serif text-navy text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Support
            </h1>

            <p className="font-serif italic text-slate text-xl leading-relaxed mb-8">
              null-pointer is a mobile client for devnull, the social network
              for developers drawn as a git log.
            </p>

            <div className="rule-fade mb-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="prose-blog"
          >
            <h2 id="app-problems">Problems with the app</h2>
            <p>
              Email{" "}
              <a href="mailto:siddarthkay@gmail.com">siddarthkay@gmail.com</a>{" "}
              with your phone model, your iOS or Android version, and what you
              were doing when it went wrong.
            </p>

            <h2 id="account-problems">Problems with your account or content</h2>
            <p>
              Accounts, posts and moderation live on devnull. Those are handled
              at{" "}
              <a href="https://dev-null.sh" rel="noopener noreferrer">
                dev-null.sh
              </a>
              , not by this app.
            </p>

            <h2 id="common-tasks">Common tasks</h2>
            <ul>
              <li>
                <strong>Sign out of this phone:</strong> Settings &rarr; Sign
                out.
              </li>
              <li>
                <strong>Revoke this phone&apos;s key:</strong> Settings &rarr;
                Manage devices on dev-null.sh.
              </li>
              <li>
                <strong>Delete your account:</strong> Settings &rarr; Delete
                account.
              </li>
              <li>
                <strong>Report, mute or block:</strong> the &hellip; menu on any
                commit, or Settings &rarr; Safety.
              </li>
            </ul>

            <h2 id="privacy">Privacy</h2>
            <p>
              What the app does with your data is described in the{" "}
              <a href="/null-pointer/privacy-policy">privacy policy</a>.
            </p>
          </motion.div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
