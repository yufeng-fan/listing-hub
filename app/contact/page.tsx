"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getListingById } from "../../lib/services/listings";
import { Inquiry } from "../../types/inquiry";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [listingId, setListingId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    if (!email.trim()) {
      setStatus("error");
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    const idToCheck = listingId.trim();
    if (!idToCheck) {
      setStatus("error");
      setError("Please enter a listing ID.");
      return;
    }

    try {
      const listing = await getListingById(idToCheck);
      if (!listing) {
        setStatus("error");
        setError("Listing ID not found. Please check the listing ID and try again.");
        return;
      }
    } catch (validationError) {
      setStatus("error");
      setError("Unable to validate listing ID. Please try again.");
      console.error("Listing validation failed", validationError);
      return;
    }

    const inquiryData = {
      listing_id: idToCheck,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "inquiries"), inquiryData);
      const inquiry: Inquiry = {
        id: docRef.id,
        ...inquiryData,
      };

      setStatus("saved");
      setName("");
      setEmail("");
      setListingId("");
      setMessage("");
      console.log("Inquiry saved:", inquiry);
    } catch (err) {
      setStatus("error");
      setError("Unable to save inquiry. Please try again.");
      console.error("Failed to save inquiry", err);
    }
  };

  return (
    <main>
      <div className="align-items-center justify-center text-center py-10">
        <h1 className="text-3xl font-bold font-serif text-white">Contact Us</h1>
      </div>
      <div className="items-center justify-center h-150 rounded max-w-1/2 mx-auto p-10 mb-10 bg-gray-700">
        <div>
          <h2>If you have any questions about a listing, please fill in the following information.</h2>
        </div>
        <div>
          <form className="flex flex-col mt-6" onSubmit={handleSubmit}>
            <label className="text-left text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="p-2 rounded border w-1/4 bg-gray-300 text-black"
              placeholder="Your Name"
              required
            />
            <label className="text-left text-white mt-4">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="p-2 rounded border w-1/4 bg-gray-300 text-black"
              placeholder="Your Email"
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            />
            <label className="text-left text-white mt-4">Listing ID (found at the end of the listing URL)</label>
            <input
              type="text"
              value={listingId}
              onChange={(event) => setListingId(event.target.value)}
              className="p-2 rounded border w-1/4 bg-gray-300 text-black"
              placeholder="Listing ID found at the end of the listing URL"
              required
            />
            <label className="text-left text-white mt-4">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="p-2 rounded border h-32 bg-gray-300 text-black"
              required
            />
            <button type="submit" className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-1/4">
              Submit
            </button>
            <div className="mt-4 text-left">
              {status === "saving" && <p className="text-white">Saving your inquiry...</p>}
              {status === "saved" && <p className="text-white">Inquiry saved successfully.</p>}
              {status === "error" && <p className="text-red-500">{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
