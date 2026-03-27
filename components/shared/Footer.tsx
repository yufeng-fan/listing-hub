import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-[#e5e7eb] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-14 pb-10 flex gap-16 flex-wrap">
        <div className="flex-none w-[200px]">
          <span className="text-xl mr-2">⬡</span>
          <span className="font-playfair text-xl font-bold text-white">
            Listing Hub
          </span>
          <p className="font-dm text-sm text-[#6b7280] mt-3">
            Find your place.
          </p>
        </div>

        <div className="flex-1 flex gap-12 flex-wrap">
          <div className="flex flex-col gap-2.5 min-w-[120px]">
            <p className="font-dm text-xs font-semibold tracking-[0.08em] uppercase text-[#9ca3af] mb-1">
              Company
            </p>
            <Link
              href="/about"
              className="font-dm text-sm text-[#d1d5db] no-underline transition-colors duration-150 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="font-dm text-sm text-[#d1d5db] no-underline transition-colors duration-150 hover:text-white"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="font-dm text-sm text-[#d1d5db] no-underline transition-colors duration-150 hover:text-white"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-5 border-t border-[#2d2d4a] font-dm text-[0.8125rem] text-[#6b7280]">
        <p>© {new Date().getFullYear()} Listing Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
