"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListingById } from "@/lib/services/listings";
import { Listing } from "@/types/listing";
import ImageGallery from "@/components/ImageGallery";
import FactGrid from "@/components/FactGrid";
import MapSnippet from "@/components/MapSnippet";

export default function ListingClient() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params.id as string;
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await getListingById(id);
      if (alive) setListing(data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!listing) return <div className="p-4">Not found.</div>;

  const lat = listing.location.latitude;
  const lng = listing.location.longitude;

  // Placeholder images, replace with listing_images later
  const images = [
    `https://picsum.photos/seed/${listing.id}/900/500`,
    `https://picsum.photos/seed/${listing.id}-2/300/200`,
    `https://picsum.photos/seed/${listing.id}-3/300/200`,
    `https://picsum.photos/seed/${listing.id}-4/300/200`,
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{listing.title}</h1>
      <ImageGallery urls={images} />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <FactGrid listing={listing} />
          <div>
            <div className="text-slate-500 text-sm mb-1">Description</div>
            <p className="text-slate-800">
              {listing.description || "No description provided."}
            </p>
          </div>
        </div>
        <div>
          <MapSnippet lat={lat} lng={lng} />
        </div>
      </div>
    </div>
  );
}
