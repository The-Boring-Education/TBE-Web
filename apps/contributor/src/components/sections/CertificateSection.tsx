import Image from "next/image";

import { LANDING } from "@/config/landing";

function CertificateFeatureIcon({ type }: { type: string }) {
  switch (type) {
    case "certificate":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 15a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" />
          <circle cx="12" cy="9.5" r="2.2" fill="#FFF1F0" />
          <path d="M7.8 14.5L6 21.5l6-3.2 6 3.2-1.8-7a6.8 6.8 0 01-8.4 0z" />
        </svg>
      );
    case "showcase":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "opportunities":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 19h3v-7H5v7zm5 0h3V7h-3v12zm5 0h3v-9h-3v9z" />
          <path d="M16 4l2.3 2.3-4.9 4.9-3.4-3.4L3 14.8l1.4 1.4 5.6-5.6 3.4 3.4 6.3-6.3L22 10V4h-6z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CertificateSection() {
  const { certificate, assets } = LANDING;

  return (
    <section id="certificate" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#FFF5F4] via-[#FFFAF9] to-[#FFF0EE] border border-[#FFE3E0] rounded-3xl p-6 sm:p-10 lg:p-14 overflow-hidden shadow-2xs">
          {/* Subtle Ambient Glow Blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FFE5E2]/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FFF1F0]/70 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Contributor Program Badge */}
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FFEAE8] border border-[#FFD5D2] text-[#EA4544] text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-4 shadow-2xs">
                {certificate.badge}
              </span>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-gray-900 tracking-tight leading-[1.12] mb-4">
                <span>{certificate.headlinePrefix} </span>
                <span className="text-[#EA4544] block sm:inline">
                  {certificate.headlineHighlight}
                </span>
              </h2>

              {/* Subtitle / Description */}
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mb-8">
                {certificate.description}
              </p>

              {/* Feature Points */}
              <div className="space-y-5 sm:space-y-6 w-full max-w-xl">
                {certificate.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF1F0] border border-[#FFDCD9] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                      <CertificateFeatureIcon type={feature.iconType} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Certificate Illustration Column */}
            <div className="lg:col-span-6 flex justify-center items-center relative">
              <div className="relative w-full max-w-lg lg:max-w-xl flex justify-center">
                <Image
                  src={assets.certificateHero}
                  alt="Earn Your Contributor Certificate - The Boring Education"
                  width={750}
                  height={500}
                  priority
                  className="w-full h-auto object-contain select-none drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
