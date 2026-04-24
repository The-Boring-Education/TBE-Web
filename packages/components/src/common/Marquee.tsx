import { motion } from "framer-motion";

interface MarqueeItem {
  title: string;
  description?: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
  className?: string;
}

const Marquee = ({ items, className = "" }: MarqueeProps) => {
  if (!items.length) {
    return null;
  }

  const loopItems = [...items, ...items];

  return (
    <div className={`space-y-3 overflow-hidden ${className}`}>
      {[0, 1].map((row) => (
        <div key={row} className="relative">
          <motion.div
            animate={{ x: row % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-3"
          >
            {loopItems.map((item, index) => (
              <div
                key={`${row}-${item.title}-${index}`}
                className="min-w-[220px] rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 opacity-65 transition hover:opacity-100"
              >
                <p className="text-xs font-semibold text-white/90">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/55">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-[#ff8b8b]/35 to-transparent" />
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default Marquee;
