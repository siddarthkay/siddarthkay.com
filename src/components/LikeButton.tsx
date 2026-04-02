import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { GC_HOST } from "@/lib/constants";

declare global {
  interface Window {
    goatcounter?: {
      count: (opts: { path: string; event: boolean; title?: string }) => void;
    };
  }
}

interface LikeButtonProps {
  slug: string;
  layout?: "vertical" | "horizontal";
}

export default function LikeButton({ slug, layout = "vertical" }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`liked-${slug}`) === "true");

    const controller = new AbortController();
    fetch(`${GC_HOST}/counter/like%2F${slug}.json`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.count) setCount(parseInt(data.count, 10));
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.warn("Like count fetch failed:", e);
      });
    return () => controller.abort();
  }, [slug]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    setCount((c) => (c ?? 0) + 1);
    localStorage.setItem(`liked-${slug}`, "true");
    window.goatcounter?.count({ path: `like/${slug}`, event: true });
  };

  const isVertical = layout === "vertical";

  return (
    <div className={`flex items-center ${isVertical ? "flex-col gap-1" : "gap-3"}`}>
      <motion.button
        onClick={handleLike}
        disabled={liked}
        whileTap={liked ? {} : { scale: 1.3 }}
        className="group cursor-pointer disabled:cursor-default"
        aria-label={liked ? "Already liked" : "Like this post"}
      >
        <Heart
          size={isVertical ? 22 : 18}
          className={`transition-colors duration-200 ${
            liked
              ? "fill-burnt text-burnt"
              : "text-slate/40 group-hover:text-burnt/60"
          }`}
        />
      </motion.button>
      {count !== null && (
        <span className={`font-mono text-slate/40 tracking-wider ${isVertical ? "text-[0.6rem]" : "text-[0.7rem]"}`}>
          {count}
        </span>
      )}
    </div>
  );
}
