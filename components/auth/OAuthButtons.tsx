"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, googleProvider, githubProvider } from "@/lib/firebase";

interface OAuthButtonsProps {
  role?: "agent" | "buyer_renter";
}

export default function OAuthButtons({ role }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleOAuth = async (provider: "google" | "github") => {
    setError("");
    setLoadingProvider(provider);
    try {
      const authProvider =
        provider === "google" ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, authProvider);
      const { user } = result;

      // Check if this is a new user — if so, write role to Firestore
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role ?? "buyer_renter",
          createdAt: new Date().toISOString(),
          provider,
        });
      }

      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth sign-in failed.";
      setError(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={!!loadingProvider}
        className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-dm text-[0.9375rem] font-medium text-gray-900 cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loadingProvider === "google" ? (
          <span className="w-4.5 h-4.5 border-2 border-gray-200 border-t-[#1a1a2e] rounded-full animate-spin flex-shrink-0" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("github")}
        disabled={!!loadingProvider}
        className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-dm text-[0.9375rem] font-medium text-gray-900 cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loadingProvider === "github" ? (
          <span className="w-4.5 h-4.5 border-2 border-gray-200 border-t-[#1a1a2e] rounded-full animate-spin flex-shrink-0" />
        ) : (
          <GitHubIcon />
        )}
        Continue with GitHub
      </button>

      {error && (
        <p className="font-dm text-[0.8125rem] text-red-500 mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  );
}
