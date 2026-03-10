import type { GradientContainerProps } from "@tbe/interface";
import { motion } from "framer-motion";

// To Put Border Color => border-borderColor${variant}
const GradientContainer = ({
  children,
  className = "",
  backgroundColor,
  childrenClassName = "p-3",
  isOncampusCard = false,
}: GradientContainerProps) => (
  <motion.div
    whileHover={
      isOncampusCard
        ? {
          scale: 1.02,
          y: -6,
          boxShadow:
            "0 20px 40px rgba(255,87,87,0.28), 0 0 0 8px rgba(255,87,87,0.12)",
        }
        : { scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }
    }
    transition={{ type: "spring", stiffness: 300 }}
    className={`flex-auto rounded-2 border ${className} ${backgroundColor ?? "bg-white dark:bg-[#19191B]"
      } transition-all duration-300`}
  >
    <div className={`rounded-2 ${childrenClassName}`}>{children}</div>
  </motion.div>
);

export default GradientContainer;
