import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const GC_HOST = "https://siddarthkay.goatcounter.com";

export default function PageViews() {
  const [count, setCount] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setCount(null);
    const path = encodeURIComponent(location.pathname.replace(/\/$/, "") || "/");
    fetch(`${GC_HOST}/counter/${path}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.count) setCount(data.count); })
      .catch(() => {});
  }, [location.pathname]);

  if (!count) return null;

  return (
    <span className="font-mono text-[0.6rem] text-slate/30 tracking-wider">
      {count} views
    </span>
  );
}
