"use client";

import { Listing } from "@/types/listing";

export default function FactGrid({ listing }: { listing: Listing }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
      <div>
        <div className="text-slate-500">Price</div>
        <div className="font-medium">${listing.price.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-slate-500">Bedrooms</div>
        <div className="font-medium">{listing.bedrooms}</div>
      </div>
      <div>
        <div className="text-slate-500">Type</div>
        <div className="font-medium">{listing.property_type}</div>
      </div>
      <div className="col-span-2 md:col-span-3">
        <div className="text-slate-500">Address</div>
        <div className="font-medium">
          {listing.address.city}, {listing.address.state_region},{" "}
          {listing.address.country} {listing.address.postal_code}
        </div>
      </div>
    </div>
  );
}
