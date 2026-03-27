"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import FormField from "@/components/shared/FormField";
import OAuthButtons from "@/components/auth/OAuthButtons";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!email) next.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setErrors({ general: "Incorrect email or password." });
      } else if (code === "auth/too-many-requests") {
        setErrors({ general: "Too many attempts. Please try again later." });
      } else {
        setErrors({ general: "Sign-in failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-white border border-[#ebebeb] rounded-[20px] p-10 shadow-[0_4px_32px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] animate-[fadeUp_0.4s_ease-out]">
        {/* Header */}
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 no-underline font-playfair text-xl font-bold text-[#1a1a2e] mb-5"
          >
            <span>⬡</span> Listing Hub
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a2e] tracking-[-0.02em] leading-tight">
            Welcome back
          </h1>
          <p className="font-dm text-sm text-gray-500 mt-1.5">
            Sign in to your account
          </p>
        </div>

        {/* OAuth */}
        <OAuthButtons />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-gray-100" />
          <span className="font-dm text-xs text-gray-400 whitespace-nowrap">
            or continue with email
          </span>
          <span className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          {errors.general && (
            <div
              className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 font-dm text-sm text-red-600 font-medium"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
          />

          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="font-dm text-xs text-gray-500 no-underline transition-colors duration-150 hover:text-[#1a1a2e]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.25 bg-[#1a1a2e] text-white border-none rounded-xl font-dm text-sm font-semibold cursor-pointer transition-all duration-150 hover:bg-[#2d2d4a] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
            ) : null}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="font-dm text-sm text-gray-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#1a1a2e] font-semibold no-underline hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
