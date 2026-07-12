import { motion } from "framer-motion";

interface MarqueeItem {
  title: string;
  description?: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
  className?: string;
  theme?: "light" | "dark";
}

const Marquee = ({ items, className = "", theme = "dark" }: MarqueeProps) => {
  if (!items.length) {
    return null;
  }

  const loopItems = [...items, ...items];

  const cardClass =
    theme === "light"
      ? "border-black/[0.08] bg-black/[0.02] opacity-80 hover:opacity-100"
      : "border-white/10 bg-white/[0.03] opacity-65 hover:opacity-100";

  const titleClass =
    theme === "light"
      ? "text-slate-800 font-semibold"
      : "text-white/90 font-semibold";

  const descClass = theme === "light" ? "text-slate-500" : "text-white/55";

  const dividerClass =
    theme === "light"
      ? "bg-gradient-to-r from-transparent via-primary/25 to-transparent"
      : "bg-gradient-to-r from-transparent via-[#ff8b8b]/35 to-transparent";

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
                className={`min-w-[220px] rounded-xl border px-3 py-2.5 transition ${cardClass}`}
              >
                <p className={`text-xs ${titleClass}`}>{item.title}</p>
                {item.description ? (
                  <p
                    className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${descClass}`}
                  >
                    {item.description}
                  </p>
                ) : null}
                <div className={`mt-2 h-px w-full ${dividerClass}`} />
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default Marquee;
