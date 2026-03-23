"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FilterBar, { FilterState } from "@/components/FilterBar";
import ViewToggle from "@/components/ViewToggle";
import SearchResultsList from "@/components/SearchResultsList";
import InfiniteScroller from "@/components/InfiniteScroller";
import MapView from "@/components/MapView";
import { fetchListingsPage } from "@/lib/services/listings";
import { Listing, ListingSummary } from "@/types/listing";

type Mode = "list" | "map" | "split";

export default function SearchClient() {
  const [mode, setMode] = useState<Mode>("split");
  const [filters, setFilters] = useState<FilterState>({
    status: "for_sale",
    city: "Calgary",
  });
  const [items, setItems] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const toSummary = (x: Listing): ListingSummary => ({
    id: x.id,
    title: x.title,
    price: x.price,
    bedrooms: x.bedrooms,
    property_type: x.property_type,
    address: x.address,
    location: {
      latitude: x.location.latitude,
      longitude: x.location.longitude,
    },
    thumbnail_url: x.images.length > 0 ? x.images[0].thumbnail_url : null,
  });

  const loadFirst = useCallback(async (f: FilterState) => {
    setLoading(true);
    try {
      const res = await fetchListingsPage(
        {
          status: f.status,
          city: f.city,
          propertyType: f.propertyType,
          priceMin: f.priceMin ?? null,
          priceMax: f.priceMax ?? null,
          bedroomsMin: f.bedroomsMin ?? null,
        },
        20,
      );
      setItems(res.items.map(toSummary));
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetchListingsPage(
        {
          status: filters.status,
          city: filters.city,
          propertyType: filters.propertyType,
          priceMin: filters.priceMin ?? null,
          priceMax: filters.priceMax ?? null,
          bedroomsMin: filters.bedroomsMin ?? null,
        },
        20,
        cursor,
      );
      setItems((prev) => [...prev, ...res.items.map(toSummary)]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, filters, loading, toSummary]);

  useEffect(() => {
    loadFirst(filters);
  }, [filters, loadFirst]);

  const onFiltersChange = (f: FilterState) => setFilters(f);

  const list = (
    <div className="space-y-3">
      <SearchResultsList items={items} />
      {hasMore && <InfiniteScroller hasMore={hasMore} onLoadMore={loadMore} />}
      {loading && (
        <div className="text-center text-sm text-slate-500">Loading…</div>
      )}
    </div>
  );

  const map = <MapView items={items} />;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar initial={filters} onChange={onFiltersChange} />
        <ViewToggle mode={mode} onChange={setMode} />
      </div>
      {mode === "list" && list}
      {mode === "map" && map}
      {mode === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list}
          {map}
        </div>
      )}
    </div>
  );
}
