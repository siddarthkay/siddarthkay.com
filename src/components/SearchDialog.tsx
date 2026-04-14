import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Fuse, { type FuseResult } from "fuse.js";
import { Search } from "lucide-react";
import { searchIndex, type SearchItem, type SearchItemType } from "@/data/search-index";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<SearchItemType, string> = {
  post: "POST",
  project: "PROJECT",
  experience: "WORK",
  tool: "USES",
  section: "PAGE",
};

function getBestMatch(res: FuseResult<SearchItem>) {
  const matches = res.matches;
  if (!matches || matches.length === 0) return null;
  return (
    matches.find((m) => m.key === "body") ||
    matches.find((m) => m.key === "tags") ||
    matches.find((m) => m.key === "title") ||
    null
  );
}

function renderSnippet(res: FuseResult<SearchItem>) {
  const match = getBestMatch(res);
  if (!match || !match.value || !match.indices?.length) return null;

  const value = match.value;
  const [firstStart, firstEnd] = match.indices[0];
  const windowBefore = 40;
  const windowAfter = 90;
  const snippetStart = Math.max(0, firstStart - windowBefore);
  const snippetEnd = Math.min(value.length, firstEnd + windowAfter);

  const parts: React.ReactNode[] = [];
  let cursor = snippetStart;
  for (const [idxStart, idxEnd] of match.indices) {
    if (idxEnd < snippetStart || idxStart > snippetEnd) continue;
    const cs = Math.max(idxStart, snippetStart);
    const ce = Math.min(idxEnd, snippetEnd);
    if (cursor < cs) {
      parts.push(<span key={`t-${cursor}`}>{value.slice(cursor, cs)}</span>);
    }
    parts.push(
      <mark
        key={`m-${idxStart}`}
        className="bg-burnt/15 text-burnt font-semibold px-0.5 rounded-sm"
      >
        {value.slice(cs, ce + 1)}
      </mark>
    );
    cursor = ce + 1;
  }
  if (cursor < snippetEnd) {
    parts.push(<span key={`t-end`}>{value.slice(cursor, snippetEnd)}</span>);
  }

  return (
    <>
      {snippetStart > 0 && "…"}
      {parts}
      {snippetEnd < value.length && "…"}
    </>
  );
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "body", weight: 1 },
        ],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.35,
        ignoreLocation: true,
      }),
    []
  );

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return fuse.search(query).slice(0, 10);
  }, [query, fuse]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
        handleSelect(results[selectedIdx].item);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, selectedIdx, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-search-result="${selectedIdx}"]`
    );
    (el as HTMLElement | null)?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.href.startsWith("/#")) {
      // Home page anchor
      const hash = item.href.slice(1);
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }
    navigate(item.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-navy/30 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-label="Search"
            aria-modal="true"
            className="fixed inset-x-0 mx-auto top-[10vh] z-[80] w-[92vw] max-w-[580px] bg-parchment border border-navy/20 shadow-2xl"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-navy/10 px-4 py-3">
              <Search className="h-4 w-4 text-slate shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, projects, tools..."
                className="flex-1 bg-transparent font-mono text-sm text-navy placeholder:text-slate/60 focus:outline-none"
                aria-label="Search"
              />
              <kbd className="font-mono text-[0.65rem] text-slate/70 border border-navy/15 px-1.5 py-0.5 rounded-sm">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-slate text-sm font-sans">
                    Type to search {searchIndex.length} items
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-slate text-sm font-sans">
                    No match for "{query}"
                  </div>
                </div>
              ) : (
                <ul ref={listRef}>
                  {results.map((res, idx) => (
                    <li
                      key={`${res.item.type}-${res.item.href}-${idx}`}
                      data-search-result={idx}
                      onClick={() => handleSelect(res.item)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`px-4 py-3 border-t border-navy/[0.06] cursor-pointer transition-colors ${
                        idx === selectedIdx ? "bg-navy/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-1">
                        <span className="font-mono text-[0.6rem] tracking-wider text-burnt border border-burnt/30 px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5">
                          {TYPE_LABELS[res.item.type]}
                        </span>
                        <div className="font-serif text-navy text-[0.95rem] leading-snug flex-1 min-w-0">
                          {res.item.title}
                        </div>
                      </div>
                      {res.item.meta && (
                        <div className="text-[0.7rem] font-mono text-slate mb-1.5 ml-[3.25rem]">
                          {res.item.meta}
                        </div>
                      )}
                      <div className="font-mono text-[0.75rem] text-slate/80 leading-relaxed line-clamp-2 ml-[3.25rem]">
                        {renderSnippet(res) || res.item.body}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 border-t border-navy/10 px-4 py-2 text-[0.65rem] font-mono text-slate/70">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="border border-navy/15 px-1 rounded-sm">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-navy/15 px-1 rounded-sm">↵</kbd>
                  open
                </span>
              </div>
              {results.length > 0 && (
                <span>
                  {results.length}{" "}
                  {results.length === 1 ? "match" : "matches"}
                </span>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
