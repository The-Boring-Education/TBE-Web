import type { LearningSidebarListProps } from "@tbe/interface";
import { cn } from "@tbe/utils";

const LearningSidebarList = <T,>({
  items,
  renderItem,
  getKey,
  className = "",
}: LearningSidebarListProps<T>) => {
  return (
    <div className={cn("flex flex-col gap-px", className)}>
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default LearningSidebarList;
