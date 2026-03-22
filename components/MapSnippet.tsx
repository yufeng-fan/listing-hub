"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function MapSnippet({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      });

      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
      ]);

      if (cancelled || !ref.current) return;

      const map = new Map(ref.current, {
        center: { lat, lng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      new AdvancedMarkerElement({
        position: { lat, lng },
        map,
      });
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return (
    <div className="h-64 rounded-lg overflow-hidden border">
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}
