import { cn } from "@tbe/utils";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useMemo } from "react";

import {
  type DifficultyGroupLabel,
  getDifficultyGroupLabel,
  getSortedDifficultyGroupEntries,
  groupItemsByDifficulty,
  STANDARD_DIFFICULTY_LABELS,
  STANDARD_DIFFICULTY_ORDER,
} from "./difficultyGrouping";
import { useExpandableGroups } from "./useExpandableGroups";

export interface DifficultyGroupedListProps<T> {
  items: readonly T[];
  /** Extract difficulty string from each item (any shape: DSA, on-campus, interview, etc.) */
  getDifficulty: (item: T) => string | undefined;
  renderItem: (item: T, context: { groupKey: string }) => ReactNode;
  /** Stable row keys; strongly recommended when items can reorder */
  getItemKey?: (item: T, index: number) => string | number;
  /** When grouping yields an empty bucket key */
  fallbackDifficulty?: string;
  /** Sort order for group keys (default: EASY → MEDIUM → HARD; unknown keys last) */
  difficultyOrder?: Readonly<Record<string, number>>;
  /** Header label + color per group key; defaults to {@link STANDARD_DIFFICULTY_LABELS} */
  difficultyLabels?: Readonly<Record<string, DifficultyGroupLabel>>;
  /** Initial open/closed state per group; omitted keys use `defaultGroupExpanded` */
  initialExpandedGroups?: Record<string, boolean>;
  /** When a group key has no entry in `initialExpandedGroups` */
  defaultGroupExpanded?: boolean;
  emptyMessage?: string;
  className?: string;
  groupClassName?: string;
  groupHeaderClassName?: string;
  groupChevronClassName?: string;
  groupCountClassName?: string;
  itemsWrapperClassName?: string;
}

export function DifficultyGroupedList<T>({
  items,
  getDifficulty,
  renderItem,
  getItemKey,
  fallbackDifficulty = "MEDIUM",
  difficultyOrder = STANDARD_DIFFICULTY_ORDER,
  difficultyLabels = STANDARD_DIFFICULTY_LABELS,
  initialExpandedGroups = {},
  defaultGroupExpanded = true,
  emptyMessage = "No items found.",
  className = "",
  groupClassName = "mb-2",
  groupHeaderClassName = "flex items-center gap-2 w-full px-1 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-200 group",
  groupChevronClassName = "w-3.5 h-3.5 text-gray-500 transition-transform duration-200",
  groupCountClassName = "text-[10px] text-gray-600 font-medium",
  itemsWrapperClassName = "flex flex-col w-full",
}: DifficultyGroupedListProps<T>) {
  const { toggleGroup, isGroupExpanded } = useExpandableGroups(
    initialExpandedGroups,
  );

  const sortedGroups = useMemo(() => {
    const grouped = groupItemsByDifficulty(
      items,
      getDifficulty,
      fallbackDifficulty,
    );
    return getSortedDifficultyGroupEntries(grouped, difficultyOrder);
  }, [items, getDifficulty, fallbackDifficulty, difficultyOrder]);

  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col w-full", className)}>
        <div className="py-8 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {sortedGroups.map(([groupKey, groupItems]) => {
        const expanded = isGroupExpanded(groupKey, defaultGroupExpanded);
        const { label, color } = getDifficultyGroupLabel(
          groupKey,
          difficultyLabels,
        );

        return (
          <div key={groupKey} className={groupClassName}>
            <button
              type="button"
              onClick={() => toggleGroup(groupKey)}
              className={groupHeaderClassName}
            >
              <ChevronDown
                className={cn(groupChevronClassName, !expanded && "-rotate-90")}
              />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  color,
                )}
              >
                {label}
              </span>
              <span className={groupCountClassName}>({groupItems.length})</span>
            </button>

            {expanded && (
              <div className={itemsWrapperClassName}>
                {groupItems.map((item, index) => (
                  <div
                    key={
                      getItemKey?.(item, index) ??
                      `${groupKey}-${String(index)}`
                    }
                  >
                    {renderItem(item, { groupKey })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
