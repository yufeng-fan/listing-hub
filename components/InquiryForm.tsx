"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createInquiry } from "@/lib/services/inquiries";
import FormField from "@/components/shared/FormField";

interface InquiryFormProps {
  listingId: string;
  agentId: string;
  onSubmitSuccess?: () => void;
}

export default function InquiryForm({
  listingId,
  agentId,
  onSubmitSuccess,
}: InquiryFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Name is required.");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required.");
      }
      if (!formData.message.trim()) {
        throw new Error("Message is required.");
      }

      await createInquiry(
        listingId,
        formData.name,
        formData.email,
        formData.message,
      );

      setFormData({ name: formData.name, email: formData.email, message: "" });
      setStatus("success");
      onSubmitSuccess?.();

      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (err: any) {
      console.error("Failed to submit inquiry", err);
      setErrorMessage(
        err.message || "Failed to submit inquiry. Please try again.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Send an Inquiry</h2>

      {status === "success" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          Your inquiry has been sent successfully!
        </div>
      )}

      {status === "error" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {errorMessage || "Failed to submit inquiry. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          id="inquiry-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your full name"
        />

        <FormField
          label="Email"
          id="inquiry-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
        />

        <div>
          <label
            htmlFor="inquiry-message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Message
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Tell the agent about your inquiry..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {status === "loading" ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}
