"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import ListingCard from "./ListingCard";
import type { ListingSummary } from "@/types/listing";

export default function SearchResultsList({
  items,
  itemHeight = 250,
  overscan = 4,
}: {
  items: ListingSummary[];
  itemHeight?: number;
  overscan?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportH, setViewportH] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const totalHeight = useMemo(
    () => Math.max(0, items.length * itemHeight),
    [items.length, itemHeight],
  );

  const visibleCount = useMemo(() => {
    if (viewportH <= 0 || itemHeight <= 0) return 0;
    return Math.ceil(viewportH / itemHeight);
  }, [viewportH, itemHeight]);

  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    if (itemHeight <= 0) {
      return { startIndex: 0, endIndex: items.length - 1, offsetTop: 0 };
    }

    const rawStart = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, rawStart - overscan);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    const offset = start * itemHeight;
    return { startIndex: start, endIndex: end, offsetTop: offset };
  }, [scrollTop, itemHeight, overscan, visibleCount, items.length]);

  const windowed = useMemo(() => {
    if (items.length === 0) return [];
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setViewportH(el.clientHeight);

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (e.target === el) {
          setViewportH(el.clientHeight);
        }
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`h-[70vh] overflow-auto rounded-lg border bg-white`}
      role="list"
      aria-label="Search results"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetTop}px)`,
          }}
        >
          {windowed.map((item, i) => {
            const actualIndex = startIndex + i;
            return (
              <div
                key={item.id}
                role="listitem"
                style={{ height: itemHeight }}
                className="p-2"
              >
                <ListingCard item={item} />
              </div>
            );
          })}
        </div>
      </div>

      {items.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
          No results.
        </div>
      )}
    </div>
  );
}
