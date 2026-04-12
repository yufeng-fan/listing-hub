"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addToFavorites,
  removeFromFavorites,
  isFavorited,
} from "@/lib/services/user";
import { ListingSummary } from "@/types/listing";

interface ListingCardProps {
  item: ListingSummary;
  showFavoriteButton?: boolean;
}

export default function ListingCard({
  item,
  showFavoriteButton = false,
}: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkIfFavorited = useCallback(async () => {
    if (!user) return;
    try {
      const favorited = await isFavorited(user.uid, item.id);
      setIsFavorite(favorited);
    } catch (err) {
      console.error("Failed to check favorite status:", err);
    }
  }, [user, item.id]);

  useEffect(() => {
    if (user && showFavoriteButton) {
      checkIfFavorited();
    }
  }, [user, showFavoriteButton, checkIfFavorited]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, item.id);
        setIsFavorite(false);
      } else {
        await addToFavorites(user.uid, item.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  const price = `$${(item.price ?? 0).toLocaleString()}`;
  return (
    <div className="relative">
      <Link href={`/listings/${item.id}`} className="block">
        <article className="border rounded-lg overflow-hidden bg-white hover:shadow transition">
          <div className="h-40 bg-slate-100">
            {item.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400">
                No Image
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-medium line-clamp-1">{item.title}</h3>
            <p className="text-sm text-slate-600">
              {price} • {item.bedrooms} bd • {item.property_type}
            </p>
            <p className="text-xs text-slate-500">{item.address.city}</p>
          </div>
        </article>
      </Link>
      {showFavoriteButton && user && user.role !== "agent" && (
        <button
          onClick={handleFavoriteToggle}
          disabled={loading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-gray-400 hover:text-red-500 border border-gray-300"
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-4 h-4"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
