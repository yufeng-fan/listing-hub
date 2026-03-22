"use client";

import Link from "next/link";
import { ListingSummary } from "@/types/listing";

export default function ListingCard({ item }: { item: ListingSummary }) {
  const price = `$${(item.price ?? 0).toLocaleString()}`;
  return (
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
  );
}
