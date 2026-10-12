import { LANDING } from "@/config/landing";

function WhyJoinIcon({ type }: { type: string }) {
  switch (type) {
    case "rocket":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.5s-4.5 4.5-4.5 9.5c0 2 .5 3.5 1.5 4.5l-2.5 2.5 1.5 1.5 2.5-2.5c1 1 2.5 1.5 4.5 1.5 5 0 9.5-4.5 9.5-4.5s-1.5-6.5-6-11l-6-1.5zm.5 7.5a2 2 0 110-4 2 2 0 010 4zM6 19l-3 3v-3H6z" />
        </svg>
      );
    case "network":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "chart":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13h2.8v6h-2.8z" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
        </svg>
      );
    case "heart":
      return (
        <svg
          className="w-6 h-6 text-[#EA4544]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WhyJoinSection() {
  const { whyJoin } = LANDING;

  return (
    <section id="why-join" className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#EA4544] font-bold text-xs tracking-widest uppercase">
            {whyJoin.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {whyJoin.heading}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2.5">
            {whyJoin.subheading}
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {whyJoin.items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="mb-4">
                <WhyJoinIcon type={item.iconType} />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug mb-2">
                {item.title}
              </h3>

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
