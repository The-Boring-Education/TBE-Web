import Image from "next/image";
import Link from "next/link";

import { LANDING } from "@/config/landing";
import { LINKS } from "@/config/links";

export default function TracksSection() {
  const { tracks, assets } = LANDING;

  return (
    <section id="tracks" className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
            {tracks.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {tracks.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2.5">
            {tracks.subheading}
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Code Track */}
          <div className="relative bg-[#FFF7F6] border border-[#FFE7E5] rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-2xs">
            {/* Quote sticker top-right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-24 sm:w-28 select-none pointer-events-none">
              <Image
                src={assets.codeTrackQuote}
                alt="Build Improve Ship"
                width={120}
                height={60}
                className="w-full h-auto object-contain"
              />
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6 pr-20 sm:pr-24">
                <div className="w-14 h-14 rounded-2xl bg-[#EA4544] text-white flex items-center justify-center font-mono text-xl font-black shrink-0 shadow-sm">
                  &lt;/&gt;
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {tracks.codeTrack.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    {tracks.codeTrack.desc}
                  </p>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-3.5 my-8">
                {tracks.codeTrack.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#EA4544] text-white flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 stroke-[3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Row: CTA and IDE Illustration */}
            <div className="flex items-end justify-between pt-6 border-t border-[#FFE2DE]/60 mt-4 relative">
              <Link
                href={LINKS.joinDevRelAdvocate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#EA4544] px-6 py-3 text-sm font-bold text-[#EA4544] shadow-2xs hover:bg-[#FFF0F0] active:scale-95 transition-all duration-150 z-10"
              >
                <span>{tracks.codeTrack.ctaText}</span>
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

              {/* IDE sticker graphic */}
              <div className="w-28 sm:w-32 -mb-2 select-none pointer-events-none">
                <Image
                  src={assets.codeTrackIde}
                  alt="Code IDE graphic"
                  width={140}
                  height={110}
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Community Track */}
          <div className="relative bg-[#FFF7F6] border border-[#FFE7E5] rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-2xs">
            {/* Quote sticker top-right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-24 sm:w-28 select-none pointer-events-none">
              <Image
                src={assets.communityTrackQuote}
                alt="Create Engage Inspire"
                width={120}
                height={60}
                className="w-full h-auto object-contain"
              />
            </div>

            <div>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6 pr-20 sm:pr-24">
                <div className="w-14 h-14 rounded-2xl bg-[#EA4544] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {tracks.communityTrack.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    {tracks.communityTrack.desc}
                  </p>
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-3.5 my-8">
                {tracks.communityTrack.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#EA4544] text-white flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 stroke-[3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Row: CTA and Megaphone Illustration */}
            <div className="flex items-end justify-between pt-6 border-t border-[#FFE2DE]/60 mt-4 relative">
              <Link
                href={LINKS.joinDevRelAdvocate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#EA4544] px-6 py-3 text-sm font-bold text-[#EA4544] shadow-2xs hover:bg-[#FFF0F0] active:scale-95 transition-all duration-150 z-10"
              >
                <span>{tracks.communityTrack.ctaText}</span>
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

              {/* Megaphone sticker graphic */}
              <div className="w-28 sm:w-32 -mb-2 select-none pointer-events-none">
                <Image
                  src={assets.communityTrackMegaphone}
                  alt="Megaphone graphic"
                  width={140}
                  height={110}
                  className="w-full h-auto object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
