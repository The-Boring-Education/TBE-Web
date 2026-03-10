import type { HeaderLabelProps } from "@tbe/interface";
import { motion } from "framer-motion";

const HeaderLabel = ({
  label,
  className = "bg-gradient-to-r from-primary/20 to-primary/10",
}: HeaderLabelProps) => (
  <motion.div
    animate="animate"
    className={` p-2 text-center text-primary ${className}`}
    exit="exit"
    initial="initial"
    transition={{ duration: 0.5, ease: "easeOut" }}
    variants={{
      initial: { x: -1000 },
      animate: { x: 0 },
      exit: { x: 1000 },
    }}
  >
    {label}
  </motion.div>
);

export default HeaderLabel;
