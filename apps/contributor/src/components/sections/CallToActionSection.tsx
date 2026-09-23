import Image from "next/image";
import Link from "next/link";

import { LANDING } from "@/config/landing";
import { LINKS } from "@/config/links";

export default function CallToActionSection() {
  const { ctaBanner, assets } = LANDING;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#FFF4F3] border border-[#FFE3E1] rounded-3xl p-8 sm:p-12 md:p-16 flex items-center justify-between overflow-hidden shadow-2xs">
          {/* Left Sticker: Better Learners */}
          <div className="hidden md:block w-36 lg:w-44 select-none pointer-events-none shrink-0 -ml-4">
            <Image
              src={assets.ctaBetterLearners}
              alt="Better Learners A Brighter Tomorrow"
              width={180}
              height={140}
              className="w-full h-auto object-contain drop-shadow-2xs"
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 text-center max-w-xl mx-auto z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
              {ctaBanner.heading}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-8">
              {ctaBanner.description}
            </p>
            <Link
              href={LINKS.joinDevRelAdvocate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA4544] px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#d93837] active:scale-95 transition-all duration-150"
            >
              <span>{ctaBanner.ctaText}</span>
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

          {/* Right Sticker: Same Students */}
          <div className="hidden md:block w-36 lg:w-44 select-none pointer-events-none shrink-0 -mr-4">
            <Image
              src={assets.ctaSameStudents}
              alt="Same Students Bigger Possibilities"
              width={180}
              height={140}
              className="w-full h-auto object-contain drop-shadow-2xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
