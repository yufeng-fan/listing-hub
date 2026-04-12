"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Inquiry } from "@/types/inquiry";
import { deleteInquiry, getAgentInquiries } from "@/lib/services/inquiries";

export default function AgentInquiriesPage() {
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      if (!user || user.role !== "agent") {
        setInquiries([]);
        setStatus("ready");
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const allInquiries = await getAgentInquiries(user.uid);
        setInquiries(allInquiries);
        setStatus("ready");
      } catch (err) {
        console.error("Failed to load inquiries", err);
        setError("Unable to load inquiries.");
        setStatus("error");
      }
    }

    if (!loading) {
      loadInquiries();
    }
  }, [user, loading]);

  const renderContent = () => {
    if (loading || status === "loading") {
      return <p className="text-gray-700">Loading inquiries…</p>;
    }

    if (!user || user.role !== "agent") {
      return <p className="text-gray-700">You must be an agent to view inquiries.</p>;
    }

    if (status === "error") {
      return <p className="text-red-500">{error || "Failed to load inquiries."}</p>;
    }

    if (inquiries.length === 0) {
      return <p className="text-gray-700">No inquiries have arrived for your listings yet.</p>;
    }

    return (
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="text-sm text-black">Listing ID</p>
                <p className="font-medium text-gray-500">{inquiry.listing_id}</p>
              </div>
              <div className="text-sm text-black">
                {new Date(inquiry.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-black">Name</p>
                <p className="text-gray-500">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-sm text-black">Email</p>
                <p className="text-gray-500">{inquiry.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-black">Message</p>
              <p className="whitespace-pre-line text-gray-500">{inquiry.message}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Delete this inquiry? This cannot be undone."
                  );
                  if (!confirmed) return;

                  setDeletingId(inquiry.id);
                  setError(null);
                  try {
                    await deleteInquiry(inquiry.id);
                    setInquiries((current) =>
                      current.filter((item) => item.id !== inquiry.id),
                    );
                  } catch (deleteError) {
                    console.error("Failed to delete inquiry", deleteError);
                    setError("Unable to delete inquiry. Please try again.");
                  } finally {
                    setDeletingId(null);
                  }
                }}
                className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
                disabled={deletingId === inquiry.id}
              >
                {deletingId === inquiry.id ? "Removing…" : "Remove Inquiry"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-3">Inquiries</h1>
        <p className="text-gray-600">
          These are inquiries from potential buyers or renters for listings you created.
        </p>
      </div>
      <div className="max-w-3xl mx-auto mb-10 px-6 py-8 bg-white rounded shadow-sm">
        {renderContent()}
      </div>
    </main>
  );
}
