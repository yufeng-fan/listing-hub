"use client";

import { useEffect, useRef } from "react";

export default function InfiniteScroller({
  onLoadMore,
  hasMore,
  rootMargin = "600px",
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { root: null, rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, onLoadMore, rootMargin]);

  return <div ref={ref} className="h-8" />;
}
