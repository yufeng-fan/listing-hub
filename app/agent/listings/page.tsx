"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import {
  getAgentListings,
  deleteListing,
} from "@/lib/services/listings";

const STATUS_LABELS: Record<string, string> = {
  for_sale: "For Sale",
  for_rent: "For Rent",
  sold: "Sold",
  rented: "Rented",
};

export default function AgentListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "agent") {
      router.replace("/login");
      return;
    }
    getAgentListings(user.uid).then((items) => {
      setListings(items);
      setLoading(false);
    });
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone."))
      return;

    setDeleting(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1a1a2e] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#1a1a2e] m-0">
            My Listings
          </h1>
          <p className="font-dm text-sm text-gray-500 mt-1 m-0">
            {listings.length} listing{listings.length !== 1 && "s"}
          </p>
        </div>
        <Link
          href="/agent/listings/new"
          className="font-dm text-sm font-semibold py-2.5 px-5 rounded-xl no-underline border-none transition-all duration-150 inline-flex items-center gap-2 bg-[#1a1a2e] text-white hover:bg-[#2d2d4a]"
        >
          <span className="text-lg leading-none">+</span> New Listing
        </Link>
      </div>

      {/* Listings list */}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="font-dm text-gray-500 text-lg mb-2">
            No listings yet
          </p>
          <p className="font-dm text-gray-400 text-sm">
            Create your first listing to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const thumb =
              listing.images?.[0]?.thumbnail_url ??
              listing.images?.[0]?.original_url;

            return (
              <div
                key={listing.id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 transition-shadow hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-dm">
                      No img
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="font-dm text-base font-semibold text-[#1a1a2e] no-underline hover:underline truncate block"
                  >
                    {listing.title}
                  </Link>
                  <p className="font-dm text-sm text-gray-500 m-0 mt-0.5">
                    {listing.address.city}, {listing.address.state_region} ·{" "}
                    {listing.bedrooms}bd · {listing.property_type}
                  </p>
                  <p className="font-dm text-sm font-semibold text-gray-800 m-0 mt-1">
                    ${(listing.price / 100).toLocaleString()}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`font-dm text-xs font-semibold tracking-[0.04em] uppercase py-1 px-2.5 rounded-full whitespace-nowrap ${
                    listing.status === "for_sale" || listing.status === "for_rent"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {STATUS_LABELS[listing.status] ?? listing.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/agent/listings/${listing.id}/edit`}
                    className="font-dm text-sm font-medium py-2 px-3.5 rounded-lg no-underline border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="font-dm text-sm font-medium py-2 px-3.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === listing.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
