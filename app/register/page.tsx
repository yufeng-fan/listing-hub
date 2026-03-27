"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import FormField from "@/components/shared/FormField";
import OAuthButtons from "@/components/auth/OAuthButtons";

type Role = "agent" | "buyer_renter";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  general?: string;
}

const ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "buyer_renter",
    label: "Buyer / Renter",
    description: "Browse and save listings",
    icon: "🏠",
  },
  {
    value: "agent",
    label: "Agent",
    description: "List and manage properties",
    icon: "🤝",
  },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email) next.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!role) next.role = "Please select a role to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { user } = credential;

      // Update display name
      await updateProfile(user, { displayName: name.trim() });

      // Save user + role to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name.trim(),
        role,
        createdAt: new Date().toISOString(),
        provider: "email",
      });

      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists." });
      } else if (code === "auth/weak-password") {
        setErrors({ password: "Password is too weak." });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-8 bg-[#f7f6f3] bg-[radial-gradient(ellipse_600px_400px_at_20%_10%,_#fef3e2_0%,_transparent_70%),radial-gradient(ellipse_400px_300px_at_90%_90%,_#e8f0fe_0%,_transparent_70%)]">
      <div className="w-full max-w-[440px] bg-white border border-[#ebebeb] rounded-[20px] p-10 shadow-[0_4px_32px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] animate-[fadeUp_0.4s_ease-out]">
        {/* Header */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 no-underline font-playfair text-xl font-bold text-[#1a1a2e] mb-4"
          >
            <span>⬡</span> Listing Hub
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a2e] tracking-[-0.02em] leading-tight">
            Create an account
          </h1>
          <p className="font-dm text-sm text-gray-500 mt-1.5">
            Get started in seconds
          </p>
        </div>

        {/* Role Picker — first so OAuth knows the role */}
        <div className="mb-5">
          <p className="font-dm text-xs font-medium tracking-wider uppercase text-gray-500 mb-2.5">
            I am a…
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRole(r.value);
                  setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                className={`flex flex-col items-center gap-1 px-3 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-150 text-center hover:border-gray-300 hover:bg-gray-100 ${
                  role === r.value
                    ? "border-[#1a1a2e] bg-blue-50 shadow-[0_0_0_3px_rgba(26,26,46,0.06)]"
                    : ""
                }`}
              >
                <span className="text-xl leading-none">{r.icon}</span>
                <span className="font-dm text-sm font-semibold text-gray-900">
                  {r.label}
                </span>
                <span className="font-dm text-xs text-gray-400">
                  {r.description}
                </span>
              </button>
            ))}
          </div>
          {errors.role && (
            <p
              className="font-dm text-xs text-red-500 font-medium mt-2"
              role="alert"
            >
              ↑ {errors.role}
            </p>
          )}
        </div>

        {/* OAuth — passes selected role */}
        <OAuthButtons role={(role as Role) || "buyer_renter"} />

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
            label="Full Name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Jane Smith"
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="At least 8 characters"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.25 bg-[#1a1a2e] text-white border-none rounded-xl font-dm text-sm font-semibold cursor-pointer transition-all duration-150 hover:bg-[#2d2d4a] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
            ) : null}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="font-dm text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#1a1a2e] font-semibold no-underline hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
