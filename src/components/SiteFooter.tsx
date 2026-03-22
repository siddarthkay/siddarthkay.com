export default function SiteFooter() {
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <p className="font-sans text-parchment/30 text-sm">
            © {new Date().getFullYear()} Siddarth Kumar
          </p>
          <p className="font-serif italic text-parchment/20 text-sm">
            Mindset is everything.
          </p>
        </div>
      </div>
    </footer>
  );
}
