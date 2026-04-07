"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const agentLinks = [
  { href: "/agent/listings", label: "Listings" },
  { href: "/agent/inquiries", label: "Inquiries" },
  { href: "/agent/profile", label: "Profile" },
];

const buyerLinks = [
  { href: "/account/favorites", label: "Favorites" },
  { href: "/account/saved-searches", label: "Saved Searches" },
  { href: "/account/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const links = user?.role === "agent" ? agentLinks : buyerLinks;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-300 mx-auto px-6 h-15 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline mr-auto">
          <span className="text-xl text-[#1a1a2e]">⬡</span>
          <span className="font-playfair text-xl font-bold text-[#1a1a2e] tracking-[-0.02em]">
            Listing Hub
          </span>
        </Link>

        {user && !loading && (
          <ul className="flex gap-1 list-none m-0 p-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-dm text-sm font-medium text-gray-600 no-underline py-1.5 px-3 rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/calculator"
          className="font-dm text-sm font-medium text-gray-600 no-underline py-1.5 px-3 rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
        >
          Calculator
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {loading ? (
            <div className="w-20 h-8 rounded-lg bg-gray-200 animate-pulse" />
          ) : user ? (
            <>
              <span className="font-dm text-xs font-semibold tracking-[0.05em] uppercase bg-green-50 text-green-600 py-0.5 px-2.5 rounded-full border border-green-200">
                {user.role === "agent" ? "Agent" : "Buyer / Renter"}
              </span>
              <span className="font-dm text-sm text-gray-700 max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="font-dm text-sm font-medium py-2 px-4.5 rounded-xl cursor-pointer border-none transition-all duration-150 inline-flex items-center bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-dm text-sm font-medium py-2 px-4.5 rounded-xl no-underline border transition-all duration-150 inline-flex items-center bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="font-dm text-sm font-medium py-2 px-4.5 rounded-xl no-underline border-none transition-all duration-150 inline-flex items-center bg-[#1a1a2e] text-white hover:bg-[#2d2d4a]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
