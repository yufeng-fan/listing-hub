import {
  collection, doc, getDoc, getDocs, limit, orderBy, query,
  startAfter, where, DocumentSnapshot, QueryConstraint
} from "firebase/firestore";
import { db } from "../firebase";
import { Listing, ListingsFilter, PageResult } from "@/types/listing";

const COLLECTION = "listings";

export async function getListingById(id: string): Promise<Listing | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromDoc(snap);
}

export async function fetchListingsPage(
  filters: ListingsFilter,
  pageSize = 20,
  cursor?: DocumentSnapshot
): Promise<PageResult<Listing>> {
  const constraints: QueryConstraint[] = [];

  // equality filters
  if (filters.status) constraints.push(where("status", "==", filters.status));
  if (filters.city) constraints.push(where("address.city", "==", filters.city));
  if (filters.propertyType) constraints.push(where("property_type", "==", filters.propertyType));

  // price inequality (single field inequality rule)
  const hasMin = typeof filters.priceMin === "number";
  const hasMax = typeof filters.priceMax === "number";
  if (hasMin && hasMax) {
    constraints.push(where("price", ">=", filters.priceMin!));
    constraints.push(where("price", "<=", filters.priceMax!));
  } else if (hasMin) {
    constraints.push(where("price", ">=", filters.priceMin!));
  } else if (hasMax) {
    constraints.push(where("price", "<=", filters.priceMax!));
  }

  // Sort strategy:
  // - If using price inequality, sort by price first, then createdAt for tiebreaker
  // - Otherwise, sort by createdAt desc (latest first)
  if (hasMin || hasMax) {
    constraints.push(orderBy("price", "asc"));
    constraints.push(orderBy("createdAt", "desc"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  constraints.push(limit(pageSize));
  if (cursor) constraints.push(startAfter(cursor));

  const baseQuery = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(baseQuery);

  // Client-side filter for bedroomsMin (due to Firestore inequality rule)
  const itemsRaw = snap.docs.map(fromDoc);
  const items = filters.bedroomsMin
    ? itemsRaw.filter((x) => x.bedrooms >= (filters.bedroomsMin as number))
    : itemsRaw;

  const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { items, nextCursor };
}

function fromDoc(s: any): Listing {
  const d = s.data();
  return {
    id: s.id,
    agent_id: d.agent_id,
    title: d.title,
    description: d.description,
    price: d.price,
    bedrooms: d.bedrooms,
    property_type: d.property_type,
    status: d.status,
    address: {
      city: d.address?.city,
      state_region: d.address?.state_region,
      postal_code: d.address?.postal_code,
      country: d.address?.country
    },
    location: {
      latitude: d.location?.latitude,
      longitude: d.location?.longitude
    },
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt
  };
}