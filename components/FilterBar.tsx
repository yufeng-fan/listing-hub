"use client";

import { useState } from "react";
import { PropertyType } from "@/types/listing";

export interface FilterState {
  city?: string;
  propertyType?: PropertyType;
  bedroomsMin?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  status?: "for_sale" | "for_rent" | "sold" | "rented";
}

export default function FilterBar({
  initial,
  onChange,
}: {
  initial?: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const [state, setState] = useState<FilterState>({
    status: "for_sale",
    ...initial,
  });

  const set = (patch: Partial<FilterState>) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-3 items-end p-3 border rounded-md bg-white">
      {/* City */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600">City</label>
        <input
          className="border rounded px-2 py-1"
          placeholder="Calgary"
          value={state.city ?? ""}
          onChange={(e) => set({ city: e.target.value || undefined })}
        />
      </div>
      {/* Property Type */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600">Property Type</label>
        <select
          className="border rounded px-2 py-1"
          value={state.propertyType ?? ""}
          onChange={(e) =>
            set({ propertyType: (e.target.value || undefined) as any })
          }
        >
          <option value="">Any</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="apartment">Apartment</option>
          <option value="duplex">Duplex</option>
          <option value="other">Other</option>
        </select>
      </div>
      {/* Bedrooms min */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600">Bedrooms (min)</label>
        <input
          className="border rounded px-2 py-1 w-28"
          type="number"
          min={0}
          value={state.bedroomsMin ?? ""}
          onChange={(e) =>
            set({ bedroomsMin: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>
      {/* Price range */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Price Min</label>
          <input
            className="border rounded px-2 py-1 w-28"
            type="number"
            min={0}
            value={state.priceMin ?? ""}
            onChange={(e) =>
              set({ priceMin: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
        <span className="pb-2">—</span>
        <div className="flex flex-col">
          <label className="text-xs text-slate-600">Price Max</label>
          <input
            className="border rounded px-2 py-1 w-28"
            type="number"
            min={0}
            value={state.priceMax ?? ""}
            onChange={(e) =>
              set({ priceMax: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>
      </div>
      {/* Status */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600">Status</label>
        <select
          className="border rounded px-2 py-1"
          value={state.status}
          onChange={(e) => set({ status: e.target.value as any })}
        >
          <option value="for_sale">For Sale</option>
          <option value="for_rent">For Rent</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>
    </div>
  );
}
