import Image from "next/image";
import Link from "next/link";

import { LANDING } from "@/config/landing";
import { LINKS } from "@/config/links";

export default function HeroSection() {
  const { hero, assets } = LANDING;

  // Student avatars for social proof
  const studentAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  ];

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white pt-8 pb-16 md:pt-14 md:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF1F0] border border-[#FFD9D7] text-[#EA4544] text-xs font-bold tracking-wide uppercase mb-6 shadow-2xs">
              <span>{hero.tag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-[1.1] mb-4">
              <span>{hero.headlinePrefix} </span>
              <span className="text-[#EA4544]">{hero.headlineHighlight}</span>
              <br />
              <span>{hero.headlineSuffix}</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-3">
              {hero.subtitle}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mb-8">
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-8">
              <Link
                href={LINKS.joinDevRelAdvocate}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA4544] px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#d93837] active:scale-95 transition-all duration-150"
              >
                <span>{hero.primaryCta}</span>
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

              <Link
                href="#perks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 px-7 py-3.5 text-base font-semibold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all duration-150 shadow-2xs"
              >
                <span>{hero.secondaryCta}</span>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </Link>
            </div>

            {/* Social Proof: Avatars & Community Text */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2.5 overflow-hidden">
                {studentAvatars.map((src, i) => (
                  <div
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden relative"
                  >
                    <Image
                      src={src}
                      alt={`Community builder ${i + 1}`}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-600 leading-tight max-w-[210px]">
                {hero.communityText}
              </span>
            </div>
          </div>

          {/* Right Column: Hero Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none">
              <Image
                src={assets.heroIllustration}
                alt="TBE Contributor Program Student Builder Illustration"
                width={650}
                height={650}
                priority
                className="w-full h-auto object-contain drop-shadow-sm select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
