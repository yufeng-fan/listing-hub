"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListingById } from "@/lib/services/listings";
import { Listing } from "@/types/listing";
import ImageGallery from "@/components/ImageGallery";
import FactGrid from "@/components/FactGrid";
import MapSnippet from "@/components/MapSnippet";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";

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

  const images: string[] =
    listing.images.length > 0
      ? [
          listing.images[0].original_url,
          ...listing.images.slice(1).map((img) => img.thumbnail_url),
        ]
      : [];

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
        <div className="space-y-6">
          <MapSnippet lat={lat} lng={lng} />
          <AffordabilityCalculator initialPrice={listing.price} />
        </div>
      </div>
    </div>
  );
}
