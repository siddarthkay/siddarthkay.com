import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GC_HOST } from "@/lib/constants";

export default function PageViews() {
  const [count, setCount] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setCount(null);
    const controller = new AbortController();
    const path = encodeURIComponent(location.pathname.replace(/\/$/, "") || "/");
    fetch(`${GC_HOST}/counter/${path}.json`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.count) setCount(data.count); })
      .catch((e) => { if (e.name !== "AbortError") console.warn("PageViews fetch failed:", e); });
    return () => controller.abort();
  }, [location.pathname]);

  if (!count) return null;

  return (
    <span className="font-mono text-[0.6rem] text-slate/30 tracking-wider">
      {count} views
    </span>
  );
}
