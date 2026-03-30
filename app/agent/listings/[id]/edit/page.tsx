"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ListingForm, { ListingFormData } from "@/components/ListingForm";
import { getListingById, updateListing } from "@/lib/services/listings";
import { Listing } from "@/types/listing";

export default function EditListingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "agent") {
      router.replace("/login");
      return;
    }

    getListingById(params.id).then((l) => {
      if (!l || l.agent_id !== user.uid) {
        setNotFound(true);
      } else {
        setListing(l);
      }
      setLoading(false);
    });
  }, [user, authLoading, router, params.id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1a1a2e] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
        <h2 className="font-playfair text-xl text-[#1a1a2e]">
          Listing not found
        </h2>
        <p className="font-dm text-sm text-gray-500">
          This listing doesn&apos;t exist or you don&apos;t have permission to edit it.
        </p>
      </div>
    );
  }

  const handleSubmit = async (data: ListingFormData) => {
    await updateListing(listing.id, data);
    router.push("/agent/listings");
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="font-dm text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer mb-4 p-0"
      >
        ← Back to listings
      </button>
      <h1 className="font-playfair text-2xl font-bold text-[#1a1a2e] mb-8 mt-0">
        Edit Listing
      </h1>
      <ListingForm
        agentId={user!.uid}
        initial={listing}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
