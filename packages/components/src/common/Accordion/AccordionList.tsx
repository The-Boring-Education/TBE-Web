import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { type ReactNode, useState } from "react";

export interface AccordionListItem {
  id?: string;
  trigger: ReactNode;
  content: ReactNode;
}

interface AccordionListProps {
  items: AccordionListItem[];
  type?: "single" | "multiple";
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  className?: string;
}

const AccordionList = ({
  items,
  type = "single",
  itemClassName = "border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white",
  triggerClassName = "w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none",
  contentClassName = "px-5 pb-2 text-gray-700 text-sm",
  className = "space-y-2 text-left",
}: AccordionListProps) => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const isOpen = (index: number) => openIndices.has(index);

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (type === "single") next.clear();
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={item.id ?? index} className={itemClassName}>
          <button
            className={triggerClassName}
            onClick={() => toggle(index)}
            type="button"
          >
            <span className="font-medium text-lg text-gray-800">
              {item.trigger}
            </span>
            <motion.span
              animate={{
                rotate: isOpen(index) ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </motion.span>
          </button>
          {isOpen(index) && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className={contentClassName}
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
            >
              {item.content}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccordionList;
