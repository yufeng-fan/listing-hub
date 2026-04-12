import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAgentListings } from "@/lib/services/listings";
import { Inquiry } from "@/types/inquiry";

const COLLECTION = "inquiries";

function fromDoc(s: any): Inquiry {
  const d = s.data();
  return {
    id: s.id,
    listing_id: d.listing_id,
    name: d.name,
    email: d.email,
    message: d.message,
    createdAt: d.createdAt,
  };
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function getAgentInquiries(agentId: string): Promise<Inquiry[]> {
  const listings = await getAgentListings(agentId);
  const listingIds = listings.map((listing) => listing.id).filter(Boolean);
  if (listingIds.length === 0) return [];

  const inquiries: Inquiry[] = [];
  const chunks = chunkArray(listingIds, 10);

  for (const ids of chunks) {
    const q = query(collection(db, COLLECTION), where("listing_id", "in", ids));
    const snap = await getDocs(q);
    inquiries.push(...snap.docs.map(fromDoc));
  }

  inquiries.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return inquiries;
}

export async function deleteInquiry(inquiryId: string): Promise<void> {
  const ref = doc(db, COLLECTION, inquiryId);
  await deleteDoc(ref);
}
