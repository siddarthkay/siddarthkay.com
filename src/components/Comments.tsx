import { useEffect, useRef, useState } from "react";
import { GRAPHCOMMENT_ID } from "@/lib/constants";

declare global {
  interface Window {
    gc_params?: {
      graphcomment_id: string;
      fixed_header_height: number;
      uid?: string;
    };
  }
}

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!containerRef.current || shouldLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || !GRAPHCOMMENT_ID) return;

    window.gc_params = {
      graphcomment_id: GRAPHCOMMENT_ID,
      fixed_header_height: 0,
      uid: slug,
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://graphcomment.com/js/integration.js?${Date.now()}`;
    document.head.appendChild(script);

    return () => {
      script.remove();
      const container = document.getElementById("graphcomment");
      if (container) container.innerHTML = "";
      delete window.gc_params;
    };
  }, [shouldLoad, slug]);

  if (!GRAPHCOMMENT_ID) return null;

  return (
    <div ref={containerRef}>
      <div className="rule-fade mt-12 mb-10" />
      <h2 className="label-mono text-slate mb-6">Comments</h2>
      <div id="graphcomment" />
    </div>
  );
}
