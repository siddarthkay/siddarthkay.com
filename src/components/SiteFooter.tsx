import { useEffect, useState } from "react";
import { GC_HOST } from "@/lib/constants";

export default function SiteFooter() {
  const [totalViews, setTotalViews] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${GC_HOST}/counter/TOTAL.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.count) setTotalViews(data.count); })
      .catch(() => {});
  }, []);

  const buildAge = (() => {
    const diff = Date.now() - new Date(__BUILD_TIME__).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    return days + "d ago";
  })();

  return (
    <footer className="bg-navy border-t border-parchment/[0.06] py-8 px-6 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-burnt opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-burnt" />
          </span>
          <span className="font-mono text-[0.6875rem] text-parchment/40 uppercase tracking-widest">
            Busy · Requests considered
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1.5">
          <p className="font-sans text-parchment/30 text-sm">
            © {new Date().getFullYear()} Siddarth Kumar
          </p>
          <span className="hidden sm:inline text-parchment/15 text-sm">·</span>
          <p className="font-serif italic text-parchment/20 text-sm">
            Mindset is everything.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {totalViews != null && (
            <span className="font-mono text-[0.6rem] text-parchment/20 tracking-wider">
              {totalViews} total views
            </span>
          )}
          <a
            href={__BUILD_URL__ || "https://github.com/siddarthkay/siddarthkay.com/commit/" + __BUILD_SHA__}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6rem] text-parchment/20 hover:text-burnt transition-colors duration-200 tracking-wider"
          >
            {__BUILD_SHA__} · deployed {buildAge}
          </a>
        </div>
      </div>
    </footer>
  );
}
