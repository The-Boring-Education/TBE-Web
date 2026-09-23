import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { LANDING } from "@/config/landing";
import { LINKS } from "@/config/links";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "#hero" },
    { name: "Perks", href: "#perks" },
    { name: "Tracks", href: "#tracks" },
    { name: "Roles", href: "#roles" },
    { name: "Why Join", href: "#why-join" },
    { name: "Process", href: "#process" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="#hero" className="flex items-center gap-3 group">
            <Image
              src={LANDING.assets.logo}
              alt="The Boring Education Logo"
              width={48}
              height={38}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <div className="border-l border-gray-300 pl-3">
              <span className="text-sm font-bold text-gray-900 leading-tight block">
                The Boring Education
              </span>
            </div>
          </Link>

          {/* Desktop Nav - In-page Smooth Scroll Links Only */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#EA4544] transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#EA4544] rounded-full transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={LINKS.joinDevRelAdvocate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA4544] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d93837] active:scale-95 transition-all duration-150"
            >
              <span>Apply Now</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href={LINKS.joinDevRelAdvocate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#EA4544] px-3.5 py-2 text-xs font-semibold text-white"
            >
              Apply Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-black rounded-lg"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="py-1.5 text-gray-700 hover:text-[#EA4544] font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
