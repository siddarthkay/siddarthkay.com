import { Beer, Heart } from "lucide-react";

type Variant = "light" | "dark";

const SPONSOR_URL = "https://github.com/sponsors/siddarthkay";
const BMC_URL = "https://buymeacoffee.com/siddarthkay";

const palette: Record<Variant, {
  label: string;
  caption: string;
  button: string;
}> = {
  dark: {
    label: "text-parchment/30",
    caption: "text-parchment/30",
    button:
      "text-parchment/80 border-parchment/20 hover:text-parchment hover:border-burnt hover:bg-burnt/10",
  },
  light: {
    label: "text-slate",
    caption: "text-slate/70",
    button:
      "text-navy/70 border-navy/15 hover:text-navy hover:border-burnt hover:bg-burnt/5",
  },
};

export default function SupportButtons({
  variant = "dark",
  showLabel = true,
  showCaption = true,
  className = "",
}: {
  variant?: Variant;
  showLabel?: boolean;
  showCaption?: boolean;
  className?: string;
}) {
  const p = palette[variant];

  const buttonClass =
    `group inline-flex items-center gap-2.5 font-mono text-sm uppercase tracking-widest px-6 py-3 bg-transparent border ${p.button} transition-all duration-200 rounded-sm`;

  return (
    <div id="support" className={`scroll-mt-24 ${className}`}>
      {showLabel && (
        <p className={`label-mono ${p.label} mb-4`}>
          <a
            href="#support"
            className="no-underline hover:no-underline hover:text-burnt transition-colors"
          >
            Support
          </a>
          {" · Optional and appreciated"}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {/* Hidden while GitHub Sponsors profile is under review. Remove `hidden` to re-enable. */}
        <a
          href={SPONSOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden ${buttonClass}`}
        >
          <Heart
            className="w-4 h-4 text-burnt transition-transform duration-200 group-hover:scale-110"
            fill="currentColor"
            strokeWidth={0}
          />
          <span>Sponsor on GitHub</span>
        </a>
        <a
          href={BMC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <Beer
            className="w-4 h-4 text-burnt transition-transform duration-200 group-hover:rotate-[-12deg]"
            strokeWidth={1.75}
          />
          <span>Buy me a beer</span>
        </a>
      </div>
      {showCaption && (
        <p className={`font-sans ${p.caption} text-sm leading-relaxed mt-3 max-w-[56ch]`}>
          If something I've built or written saved you time, you can keep the lights on.
        </p>
      )}
    </div>
  );
}
