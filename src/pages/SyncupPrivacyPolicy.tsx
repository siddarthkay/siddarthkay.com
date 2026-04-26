import { motion } from "framer-motion";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ease } from "@/lib/motion";

export default function SyncupPrivacyPolicy() {
  useDocumentTitle("SyncUp Privacy Policy | Siddarth Kumar");

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
              <span className="label-mono text-burnt">SyncUp</span>
              <span className="label-mono text-slate/40">·</span>
              <span className="label-mono text-slate">Last updated April 26, 2026</span>
            </div>

            <h1 className="font-serif text-navy text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Privacy Policy
            </h1>

            <p className="font-serif italic text-slate text-xl leading-relaxed mb-8">
              SyncUp is an open-source client for the Syncthing peer-to-peer
              file synchronization protocol. This policy describes what
              information the app and its developer do — and do not — handle.
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
              SyncUp does not collect, transmit, or store any personal
              information on servers operated by the developer. The developer
              has no analytics, advertising, or tracking infrastructure of any
              kind. There is no user account, no login, and no associated
              cloud service.
            </p>

            <h2 id="what-the-app-does">What the app does</h2>
            <p>
              SyncUp embeds the Syncthing daemon and lets your iPhone act as
              a node in a Syncthing network you set up yourself. Files in
              folders you choose to share are transferred directly between
              devices that you have explicitly paired with each other. All
              transfers are end-to-end encrypted in transit using TLS 1.3.
            </p>

            <h2 id="data-on-your-device">Data stored on your device</h2>
            <p>
              The following data is stored locally on your device and never
              leaves it except in the form of peer-to-peer Syncthing
              traffic to devices you have authorized:
            </p>
            <ul>
              <li>Your Syncthing device identity (a public/private key pair).</li>
              <li>The list of remote devices you have added.</li>
              <li>The list of folders you have configured for sync.</li>
              <li>Files that you have chosen to sync.</li>
              <li>App preferences (theme, sync conditions, etc.).</li>
            </ul>
            <p>
              All of this data is removed when you uninstall the app.
            </p>

            <h2 id="network-connections">Network connections</h2>
            <p>
              The Syncthing daemon contacts the following hosts as part of
              normal protocol operation. None of these are operated by the
              developer of this app:
            </p>
            <ul>
              <li>
                <strong>Peer devices.</strong> Direct TCP/QUIC connections to
                the IP addresses of devices you have paired with. File data,
                folder metadata, and index updates flow over these
                connections.
              </li>
              <li>
                <strong>Syncthing global discovery servers.</strong> The
                daemon periodically announces its public key (device ID) to
                the discovery infrastructure operated by the Syncthing
                Foundation, so other devices that hold your device ID can
                find your current IP address. No file content or folder
                metadata is sent to discovery servers.
              </li>
              <li>
                <strong>Syncthing relay servers.</strong> When two paired
                devices cannot reach each other directly (for example, both
                are behind NAT), traffic may be routed through a community
                relay. Relay traffic is end-to-end encrypted; the relay
                operator cannot read the content.
              </li>
              <li>
                <strong>Local network discovery.</strong> Multicast packets
                on your local network so peers on the same Wi-Fi can find
                each other without contacting the internet.
              </li>
            </ul>
            <p>
              Discovery and relay infrastructure is documented at{" "}
              <a href="https://docs.syncthing.net/users/firewall.html" rel="noopener noreferrer">
                docs.syncthing.net
              </a>
              .
            </p>

            <h2 id="permissions">Permissions the app requests</h2>
            <ul>
              <li>
                <strong>Camera</strong> — used only when you tap "Scan QR" to
                pair with a peer device. The image is processed on-device
                and is not stored or transmitted.
              </li>
              <li>
                <strong>Photo library</strong> — used only if you opt in to
                including photos or videos in a synced folder. Items are
                read from the library and added to a folder you control;
                they are not uploaded anywhere by SyncUp itself.
              </li>
              <li>
                <strong>Local network</strong> — used to discover peer
                devices on the same Wi-Fi network.
              </li>
            </ul>

            <h2 id="children">Children</h2>
            <p>
              SyncUp is not directed at children under 13 and the developer
              does not knowingly collect any data from children.
            </p>

            <h2 id="third-parties">Third-party services</h2>
            <p>
              SyncUp does not include any third-party analytics, crash
              reporting, advertising, or tracking SDKs.
            </p>

            <h2 id="changes">Changes to this policy</h2>
            <p>
              If this policy changes, the updated version will be posted at
              this URL with a new "Last updated" date.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href="mailto:siddarthkay@gmail.com">siddarthkay@gmail.com</a>{" "}
              or filed as an issue at{" "}
              <a
                href="https://github.com/siddarthkay/syncthing-app/issues"
                rel="noopener noreferrer"
              >
                github.com/siddarthkay/syncthing-app
              </a>
              .
            </p>
          </motion.div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
