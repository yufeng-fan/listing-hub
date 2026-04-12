"use client";

import { FormEvent, useState } from "react";
import FormField from "@/components/shared/FormField";
import ImageUploader, { ImageItem } from "@/components/ImageUploader";
import { uploadListingImage } from "@/lib/services/listings";
import {
  Listing,
  ListingImage,
  ListingStatus,
  PropertyType,
} from "@/types/listing";

export interface ListingFormData {
  title: string;
  description: string;
  price: number; // cents
  bedrooms: number;
  property_type: PropertyType;
  status: ListingStatus;
  address: {
    city: string;
    state_region: string;
    postal_code: string;
    country: string;
  };
  location: { latitude: number; longitude: number };
  images: ListingImage[];
}

interface ListingFormProps {
  agentId: string;
  initial?: Listing;
  onSubmit: (data: ListingFormData) => Promise<void>;
  submitLabel: string;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
];

export default function ListingForm({
  agentId,
  initial,
  onSubmit,
  submitLabel,
}: ListingFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial ? (initial.price / 100).toString() : "",
  );
  const [bedrooms, setBedrooms] = useState(
    initial?.bedrooms?.toString() ?? "",
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initial?.property_type ?? "house",
  );
  const [status, setStatus] = useState<ListingStatus>(
    initial?.status ?? "for_sale",
  );
  const [city, setCity] = useState(initial?.address?.city ?? "");
  const [stateRegion, setStateRegion] = useState(
    initial?.address?.state_region ?? "",
  );
  const [postalCode, setPostalCode] = useState(
    initial?.address?.postal_code ?? "",
  );
  const [country, setCountry] = useState(initial?.address?.country ?? "");
  const [latitude, setLatitude] = useState(
    initial?.location?.latitude?.toString() ?? "",
  );
  const [longitude, setLongitude] = useState(
    initial?.location?.longitude?.toString() ?? "",
  );
  const [images, setImages] = useState<ImageItem[]>(
    initial?.images ?? [],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!priceDollars || Number(priceDollars) <= 0)
      e.price = "Enter a valid price";
    if (!bedrooms || Number(bedrooms) < 0)
      e.bedrooms = "Enter number of bedrooms";
    if (!city.trim()) e.city = "City is required";
    if (!stateRegion.trim()) e.stateRegion = "State/region is required";
    if (!postalCode.trim()) e.postalCode = "Postal code is required";
    if (!country.trim()) e.country = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGeneralError("");

    try {
      // Upload pending images (local previews → storage) before saving
      const pendingImages = images.filter((img) => !!img.file);
      const savedImages = images.filter((img) => !img.file);

      const uploadedImages = await Promise.all(
        pendingImages.map((img) =>
          uploadListingImage(agentId, img.file!, img.order),
        ),
      );

      // Revoke blob preview URLs
      pendingImages.forEach((img) => URL.revokeObjectURL(img.original_url));

      const finalImages: ListingImage[] = [
        ...savedImages.map(({ file: _, ...rest }): ListingImage => rest),
        ...uploadedImages,
      ].map((img, idx) => ({ ...img, order: idx }));

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: Math.round(Number(priceDollars) * 100),
        bedrooms: Number(bedrooms),
        property_type: propertyType,
        status,
        address: {
          city: city.trim(),
          state_region: stateRegion.trim(),
          postal_code: postalCode.trim(),
          country: country.trim(),
        },
        location: {
          latitude: Number(latitude) || 0,
          longitude: Number(longitude) || 0,
        },
        images: finalImages,
      });
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyle =
    "font-dm text-[0.9375rem] text-gray-900 bg-white border-[1.5px] border-gray-200 rounded-[10px] py-[11px] px-[14px] outline-none transition-[border-color,box-shadow] duration-150 w-full focus:border-[#1a1a2e] focus:shadow-[0_0_0_3px_rgba(26,26,46,0.08)]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {generalError && (
        <div className="font-dm text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {generalError}
        </div>
      )}

      {/* Basic info */}
      <section className="flex flex-col gap-4">
        <h3 className="font-playfair text-lg font-semibold text-[#1a1a2e] m-0">
          Basic Information
        </h3>
        <FormField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="e.g. Modern 3BR in Downtown"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="font-dm text-[0.8125rem] font-medium tracking-[0.04em] uppercase text-gray-500">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the property…"
            className="font-dm text-[0.9375rem] text-gray-900 bg-white border-[1.5px] border-gray-200 rounded-[10px] py-[11px] px-[14px] outline-none transition-[border-color,box-shadow] duration-150 w-full resize-y focus:border-[#1a1a2e] focus:shadow-[0_0_0_3px_rgba(26,26,46,0.08)]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Price ($)"
            type="number"
            min="0"
            step="0.01"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            error={errors.price}
            placeholder="250000"
            required
          />
          <FormField
            label="Bedrooms"
            type="number"
            min="0"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            error={errors.bedrooms}
            placeholder="3"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-dm text-[0.8125rem] font-medium tracking-[0.04em] uppercase text-gray-500">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className={selectStyle}
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-dm text-[0.8125rem] font-medium tracking-[0.04em] uppercase text-gray-500">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ListingStatus)}
            className={selectStyle}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Address */}
      <section className="flex flex-col gap-4">
        <h3 className="font-playfair text-lg font-semibold text-[#1a1a2e] m-0">
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            required
          />
          <FormField
            label="State / Region"
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
            error={errors.stateRegion}
            required
          />
          <FormField
            label="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            error={errors.postalCode}
            required
          />
          <FormField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors.country}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="40.7128"
          />
          <FormField
            label="Longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-74.0060"
          />
        </div>
      </section>

      {/* Images */}
      <section className="flex flex-col gap-4">
        <h3 className="font-playfair text-lg font-semibold text-[#1a1a2e] m-0">
          Images
        </h3>
        <ImageUploader
          images={images}
          onChange={setImages}
        />
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="font-dm text-sm font-semibold py-3 px-6 rounded-xl border-none cursor-pointer transition-all duration-150 bg-[#1a1a2e] text-white hover:bg-[#2d2d4a] disabled:opacity-50 disabled:cursor-not-allowed self-start"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
