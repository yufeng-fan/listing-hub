export type ListingStatus = "for_sale" | "for_rent" | "sold" | "rented";
export type PropertyType =
  | "house"
  | "condo"
  | "townhouse"
  | "apartment"
  | "duplex"
  | "other";

export interface Address {
  city: string;
  state_region: string;
  postal_code: string;
  country: string;
}

export interface GeoPointLike {
  latitude: number;
  longitude: number;
}

export interface ListingImage {
  id: string; // uuid
  original_url: string;
  thumbnail_url: string;
  path: string; // storage path for deletion
  width: number;
  height: number;
  order: number;
  uploaded_at: string; // ISO string
}

export interface Listing {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  price: number; // cents
  bedrooms: number;
  property_type: PropertyType;
  status: ListingStatus;
  address: Address;
  location: GeoPointLike; // serialized from Firestore GeoPoint
  images: ListingImage[]; // ordered list, images[0] is the cover image
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type ListingSummary = Pick<
  Listing,
  | "id"
  | "title"
  | "price"
  | "bedrooms"
  | "property_type"
  | "address"
  | "location"
> & { thumbnail_url?: string | null };

export interface ListingsFilter {
  status?: ListingStatus; // default: 'for_sale'
  city?: string;
  propertyType?: PropertyType;
  priceMin?: number | null;
  priceMax?: number | null;
  bedroomsMin?: number | null;
}

export interface PageResult<T> {
  items: T[];
  nextCursor: any | null;
}

// User Favorites
export interface UserFavorite {
  id: string;
  user_id: string;
  listing_id: string;
  createdAt: string; // ISO string
}

// Saved Searches
export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: ListingsFilter;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
