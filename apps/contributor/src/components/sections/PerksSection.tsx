import { LANDING } from "@/config/landing";

function PerkIcon({ type }: { type: string }) {
  switch (type) {
    case "meeting":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "gift":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      );
    case "certificate":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm5 10.5H7v-1.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V18z" />
        </svg>
      );
    case "meetup":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case "ribbon":
      return (
        <svg
          className="w-5 h-5 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-2.5 2.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function PerksSection() {
  const { perks } = LANDING;

  return (
    <section id="perks" className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
            {perks.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {perks.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2.5">
            {perks.subheading}
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {perks.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F0] flex items-center justify-center mb-4">
                <PerkIcon type={item.iconType} />
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
