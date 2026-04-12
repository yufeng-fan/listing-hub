import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserFavorite, SavedSearch, ListingsFilter } from "@/types/listing";

/* ── Favorites ──────────────────────────────────────────── */

const FAVORITES_COLLECTION = "favorites";

export async function getUserFavorites(
  userId: string,
): Promise<UserFavorite[]> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("user_id", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromFavoriteDoc);
}

export async function addToFavorites(
  userId: string,
  listingId: string,
): Promise<string> {
  // Check if already favorited
  const existing = await getDocs(
    query(
      collection(db, FAVORITES_COLLECTION),
      where("user_id", "==", userId),
      where("listing_id", "==", listingId),
    ),
  );

  if (!existing.empty) {
    throw new Error("Listing already in favorites");
  }

  const docRef = await addDoc(collection(db, FAVORITES_COLLECTION), {
    user_id: userId,
    listing_id: listingId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function removeFromFavorites(
  userId: string,
  listingId: string,
): Promise<void> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("user_id", "==", userId),
    where("listing_id", "==", listingId),
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref);
  }
}

export async function isFavorited(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("user_id", "==", userId),
    where("listing_id", "==", listingId),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

function fromFavoriteDoc(s: any): UserFavorite {
  const d = s.data();
  return {
    id: s.id,
    user_id: d.user_id,
    listing_id: d.listing_id,
    createdAt: d.createdAt?.toDate
      ? d.createdAt.toDate().toISOString()
      : d.createdAt,
  };
}

/* ── Saved Searches ─────────────────────────────────────── */

const SAVED_SEARCHES_COLLECTION = "saved_searches";

export async function getUserSavedSearches(
  userId: string,
): Promise<SavedSearch[]> {
  const q = query(
    collection(db, SAVED_SEARCHES_COLLECTION),
    where("user_id", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromSavedSearchDoc);
}

export async function createSavedSearch(
  userId: string,
  name: string,
  filters: ListingsFilter,
): Promise<string> {
  const docRef = await addDoc(collection(db, SAVED_SEARCHES_COLLECTION), {
    user_id: userId,
    name,
    filters,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSavedSearch(
  id: string,
  name: string,
  filters: ListingsFilter,
): Promise<void> {
  const ref = doc(db, SAVED_SEARCHES_COLLECTION, id);
  await updateDoc(ref, {
    name,
    filters,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await deleteDoc(doc(db, SAVED_SEARCHES_COLLECTION, id));
}

function fromSavedSearchDoc(s: any): SavedSearch {
  const d = s.data();
  return {
    id: s.id,
    user_id: d.user_id,
    name: d.name,
    filters: d.filters,
    createdAt: d.createdAt?.toDate
      ? d.createdAt.toDate().toISOString()
      : d.createdAt,
    updatedAt: d.updatedAt?.toDate
      ? d.updatedAt.toDate().toISOString()
      : d.updatedAt,
  };
}
