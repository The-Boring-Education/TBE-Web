import Image from "next/image";

import { LANDING } from "@/config/landing";

function RoleIcon({ type }: { type: string }) {
  switch (type) {
    case "contributor":
      return (
        <svg
          className="w-12 h-12 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case "captain":
      return (
        <svg className="w-14 h-12" viewBox="0 0 64 48" fill="none">
          {/* Hat Crown */}
          <path
            d="M12 24C12 14 20 6 32 6C44 6 52 14 52 24L55 29C55 30.5 53.5 32 51 32H13C10.5 32 9 30.5 9 29L12 24Z"
            fill="#EA4544"
          />
          {/* Gold Band & Trim */}
          <path
            d="M11 29H53V34C53 35.5 51.5 36.5 49 36.5H15C12.5 36.5 11 35.5 11 34V29Z"
            fill="#E5A01A"
          />
          <rect x="12" y="29" width="40" height="4" fill="#FBBF24" />
          {/* Center Badge */}
          <circle cx="32" cy="27" r="4.5" fill="#FBBF24" />
          <circle cx="32" cy="27" r="2.5" fill="#D97706" />
          {/* Visor / Brim */}
          <path
            d="M9 35C16 43 48 43 55 35C52 41 43 45 32 45C21 45 12 41 9 35Z"
            fill="#262626"
          />
        </svg>
      );
    case "lead":
      return (
        <svg
          className="w-12 h-12 text-[#EA4544]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 16L3 5l5.5 5L12 3l3.5 7L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
          <circle cx="3" cy="5" r="1.5" />
          <circle cx="12" cy="3" r="1.5" />
          <circle cx="21" cy="5" r="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function RolesGrowthSection() {
  const { roles, assets } = LANDING;

  return (
    <section id="roles" className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
            {roles.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {roles.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2.5">
            {roles.subheading}
          </p>
        </div>

        {/* 3 Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
          {roles.items.map((item, index) => {
            const isLead = item.iconType === "lead";

            return (
              <div
                key={item.role}
                className="relative bg-white border border-[#FFE7E5] rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Lead Build Represent Sticker on TBE Lead */}
                {isLead && (
                  <div className="absolute -top-10 -right-4 sm:-top-12 sm:-right-8 w-28 sm:w-36 pointer-events-none select-none z-20">
                    <Image
                      src={assets.leadBuildRepresent}
                      alt="Lead Build Represent"
                      width={140}
                      height={80}
                      priority
                      className="w-full h-auto object-contain drop-shadow-sm"
                    />
                  </div>
                )}

                {/* Top Section */}
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="h-14 flex items-center justify-center mb-3">
                    <RoleIcon type={item.iconType} />
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {item.role}
                  </h3>

                  {/* Badge */}
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FFF1F0] border border-[#FFD9D7] text-[#EA4544] text-[11px] sm:text-xs font-bold tracking-wide mt-2 mb-3 shadow-2xs">
                    {item.badge}
                  </span>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 px-2">
                    {item.description}
                  </p>
                </div>

                {/* Perks Checklist */}
                <ul className="space-y-3 pt-5 border-t border-[#FFEAE8]/70 w-full mt-auto">
                  {item.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-left">
                      <span className="w-4 h-4 rounded-full bg-[#EA4544] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <svg
                          className="w-2.5 h-2.5 stroke-[3]"
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
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Connector Arrow on Desktop */}
                {index < roles.items.length - 1 && (
                  <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#FFE2DE] shadow-xs items-center justify-center text-[#EA4544]">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
