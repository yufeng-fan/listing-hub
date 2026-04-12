"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserFavorites, removeFromFavorites } from "@/lib/services/user";
import { getListingById } from "@/lib/services/listings";
import { UserFavorite, Listing } from "@/types/listing";
import ListingCard from "./ListingCard";

export default function FavoritesGrid() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        const userFavorites = await getUserFavorites(user.uid);

        // Fetch listing details for each favorite
        const listingPromises = userFavorites.map(async (fav) => {
          return await getListingById(fav.listing_id);
        });

        const fetchedListings = await Promise.all(listingPromises);
        const validListings = fetchedListings.filter(
          (l): l is Listing => l !== null,
        );

        setFavorites(userFavorites);
        setListings(
          validListings.map((l) => ({
            ...l,
            thumbnail_url:
              l.images.length > 0 ? l.images[0].thumbnail_url : null,
          })),
        );
      } catch (err) {
        setError("Failed to load favorites");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (listingId: string) => {
    if (!user) return;

    try {
      await removeFromFavorites(user.uid, listingId);
      setFavorites((prev) => prev.filter((f) => f.listing_id !== listingId));
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your favorites.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p>You haven&apos;t favorited any listings yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div key={listing.id} className="relative">
          <ListingCard item={listing} />
          <button
            onClick={() => handleRemoveFavorite(listing.id)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            title="Remove from favorites"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
