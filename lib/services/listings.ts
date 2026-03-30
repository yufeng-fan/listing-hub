import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";
import { Listing, ListingImage, ListingsFilter, PageResult } from "@/types/listing";

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
  cursor?: DocumentSnapshot,
): Promise<PageResult<Listing>> {
  const constraints: QueryConstraint[] = [];

  // equality filters
  if (filters.status) constraints.push(where("status", "==", filters.status));
  if (filters.city) constraints.push(where("address.city", "==", filters.city));
  if (filters.propertyType)
    constraints.push(where("property_type", "==", filters.propertyType));

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

  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

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
      country: d.address?.country,
    },
    location: {
      latitude: d.location?.latitude,
      longitude: d.location?.longitude,
    },
    images: Array.isArray(d.images)
      ? d.images.map((img: any, idx: number) => ({
          id: img.id || `${s.id}-img-${idx}`,
          original_url: img.original_url,
          thumbnail_url: img.thumbnail_url,
          width: img.width,
          height: img.height,
          order: img.order,
          uploaded_at: img.uploaded_at,
        }))
      : [],

    createdAt: d.createdAt?.toDate
      ? d.createdAt.toDate().toISOString()
      : d.createdAt,
    updatedAt: d.updatedAt?.toDate
      ? d.updatedAt.toDate().toISOString()
      : d.updatedAt,
  };
}

/* ── Agent listings ─────────────────────────────────────── */

export async function getAgentListings(agentId: string): Promise<Listing[]> {
  const q = query(
    collection(db, COLLECTION),
    where("agent_id", "==", agentId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

/* ── Create ─────────────────────────────────────────────── */

export type ListingInput = Omit<Listing, "id" | "createdAt" | "updatedAt" | "images"> & {
  images?: ListingImage[];
};

export async function createListing(data: ListingInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    images: data.images ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/* ── Update ─────────────────────────────────────────────── */

export async function updateListing(
  id: string,
  data: Partial<ListingInput>,
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/* ── Delete ─────────────────────────────────────────────── */

export async function deleteListing(id: string): Promise<void> {
  // Fetch existing images to clean up storage
  const listing = await getListingById(id);
  if (listing) {
    await Promise.all(
      listing.images.map((img) => deleteListingImage(img.original_url)),
    );
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

/* ── Image upload / delete ──────────────────────────────── */

export async function uploadListingImage(
  agentId: string,
  file: File,
  order: number,
): Promise<ListingImage> {
  const id = crypto.randomUUID();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `listings/${agentId}/${id}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const url = await getDownloadURL(storageRef);

  return {
    id,
    original_url: url,
    thumbnail_url: url, // same URL – Firebase serves resized via image transforms
    width: 0,
    height: 0,
    order,
    uploaded_at: new Date().toISOString(),
  };
}

export async function deleteListingImage(imageUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch {
    // Image may already be deleted or URL may not be a storage path
  }
}
