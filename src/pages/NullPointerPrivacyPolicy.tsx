import { motion } from "framer-motion";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ease } from "@/lib/motion";

export default function NullPointerPrivacyPolicy() {
  useDocumentTitle("null-pointer Privacy Policy | Siddarth Kumar");

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
              <span className="label-mono text-slate/40">·</span>
              <span className="label-mono text-slate">Last updated October 21, 2026</span>
            </div>

            <h1 className="font-serif text-navy text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Privacy Policy
            </h1>

            <p className="font-serif italic text-slate text-xl leading-relaxed mb-8">
              null-pointer is a mobile client for devnull, a social network for
              developers drawn as a git log. This policy describes what the app
              itself does with your data. devnull&apos;s own policy covers the
              service you sign in to.
            </p>

            <div className="rule-fade mb-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="prose-blog"
          >
            <h2 id="summary">Summary</h2>
            <p>
              null-pointer sends requests to devnull (dev-null.sh) and to no
              other server. The developer operates no backend, no analytics,
              no advertising and no tracking infrastructure. The app contains
              no third-party SDKs that collect data.
            </p>

            <h2 id="data-on-your-device">Data stored on your device</h2>
            <ul>
              <li>
                <strong>A device key.</strong> On first launch the app
                generates an Ed25519 key pair and keeps the private half in the
                iOS Keychain or Android Keystore. It identifies this phone to
                devnull and never leaves the device.
              </li>
              <li>
                <strong>Your devnull profile and a cache</strong> of recent
                posts, notifications and profiles you opened, so screens load
                instantly. The cache is cleared when you sign out.
              </li>
              <li>Drafts you have written but not sent.</li>
              <li>Your theme preference.</li>
            </ul>
            <p>All of this is removed when you uninstall the app.</p>

            <h2 id="data-sent-to-devnull">Data sent to devnull</h2>
            <p>
              Every request the app makes goes to devnull and is signed with
              the device key, so devnull knows which account it belongs to.
              The app sends:
            </p>
            <ul>
              <li>
                <strong>The public half of the device key</strong> and a device
                name such as &quot;devnull on iPhone 15 Pro&quot; when you sign
                in, so you can recognise and revoke this phone later from
                devnull&apos;s settings.
              </li>
              <li>
                <strong>Content you create:</strong> commits, replies, quotes,
                stars, follows, reports and account settings.
              </li>
            </ul>
            <p>
              devnull&apos;s handling of that data is described in devnull&apos;s
              own privacy policy at{" "}
              <a href="https://dev-null.sh" rel="noopener noreferrer">
                dev-null.sh
              </a>
              .
            </p>

            <h2 id="signing-in">Signing in</h2>
            <p>
              Sign-in happens on dev-null.sh through GitHub, in the system
              browser. The app never sees your GitHub password and holds no
              session token; devnull approves the device key instead.
            </p>

            <h2 id="links">Links and images</h2>
            <p>
              Images in posts are loaded from the servers devnull points to.
              Links in posts open in the system&apos;s in-app browser; the site
              you open then sees you as any browser visit would.
            </p>

            <h2 id="deleting-your-data">Deleting your data</h2>
            <ul>
              <li>
                <strong>Sign out</strong> in Settings removes the cached profile
                and posts from the phone.
              </li>
              <li>
                <strong>Delete account</strong> in Settings deletes your account
                and this device&apos;s key on devnull.
              </li>
              <li>Uninstalling the app removes everything it stored.</li>
            </ul>

            <h2 id="children">Children</h2>
            <p>
              null-pointer is not directed at children under 13, and devnull
              requires a GitHub account.
            </p>

            <h2 id="third-parties">Third-party services</h2>
            <p>
              null-pointer includes no third-party analytics, crash reporting,
              advertising or tracking SDKs. null-pointer is an independent
              client and is not affiliated with devnull.
            </p>

            <h2 id="changes">Changes to this policy</h2>
            <p>
              If this policy changes, the updated version will be posted at
              this URL with a new &quot;Last updated&quot; date.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href="mailto:siddarthkay@gmail.com">siddarthkay@gmail.com</a>.
            </p>
          </motion.div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
