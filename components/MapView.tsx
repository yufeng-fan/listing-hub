"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { ListingSummary } from "@/types/listing";

type GoogleMapBBox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

export default function MapView({
  items,
  center = { lat: 51.0447, lng: -114.0719 },
  zoom = 11,
  onViewportChange,
}: {
  items: ListingSummary[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onViewportChange?: (bbox: GoogleMapBBox) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

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

      if (!mapRef.current) {
        mapRef.current = new Map(ref.current, {
          center,
          zoom,
          mapId: "DEMO_MAP_ID", // Google's built-in dev placeholder
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Emit bbox on idle
        if (onViewportChange) {
          const emit = () => {
            const b = mapRef.current!.getBounds();
            if (!b) return;
            const ne = b.getNorthEast();
            const sw = b.getSouthWest();
            onViewportChange([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
          };
          mapRef.current.addListener("idle", emit);
          emit();
        }
      }

      // Clear previous markers/cluster
      clustererRef.current?.clearMarkers();
      markersRef.current.forEach((m) => (m.map = null as any));
      markersRef.current = [];

      // Build AdvancedMarkers
      const markers = items.map((it) => {
        const lat = it.location.latitude ?? (it as any).location.latitude;
        const lng = it.location.longitude ?? (it as any).location.longitude;

        const marker = new AdvancedMarkerElement({
          position: { lat, lng },
          title: it.title,
        });

        const info = new google.maps.InfoWindow({
          content: `
            <div style="min-width:200px">
              <strong>${escapeHtml(it.title)}</strong><br/>
              $${(it.price ?? 0).toLocaleString()} • ${it.bedrooms} bd<br/>
              ${escapeHtml(it.address.city || "")}
            </div>
          `,
        });
        marker.addListener("gmp-click", () => {
          info.open({ anchor: marker, map: mapRef.current! });
        });
        return marker;
      });
      markersRef.current = markers;

      // Cluster the AdvancedMarkers
      clustererRef.current = new MarkerClusterer({
        markers,
        map: mapRef.current!,
      });
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [items, center.lat, center.lng, zoom, onViewportChange]);

  return (
    <div className="h-[70vh] rounded-lg overflow-hidden border bg-white">
      <div ref={ref} className="w-full h-full" />
    </div>
  );
}

function escapeHtml(str: string) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m] as string,
  );
}
