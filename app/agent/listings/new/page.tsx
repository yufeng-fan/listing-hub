"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ListingForm, { ListingFormData } from "@/components/ListingForm";
import { createListing } from "@/lib/services/listings";

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "agent")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1a1a2e] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const handleSubmit = async (data: ListingFormData) => {
    await createListing({ ...data, agent_id: user.uid });
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
        New Listing
      </h1>
      <ListingForm
        agentId={user.uid}
        onSubmit={handleSubmit}
        submitLabel="Create Listing"
      />
    </div>
  );
}
