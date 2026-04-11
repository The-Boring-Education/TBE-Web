import type { DifficultyQuestionListProps } from "@tbe/interface";

import { DifficultyGroupedList } from "../GroupedList/DifficultyGroupedList";
import {
  STANDARD_DIFFICULTY_LABELS,
  STANDARD_DIFFICULTY_ORDER,
} from "../GroupedList/difficultyGrouping";
import { QuestionRow } from "./QuestionRow";

/**
 * Opinionated checklist: groups items by difficulty and renders {@link QuestionRow} per item.
 */
export function DifficultyQuestionList<T>({
  items,
  getDifficulty,
  getItemKey,
  resolveRow,
  onItemClick,
  onToggleItemComplete,
  emptyMessage = "No items found.",
  className = "",
  initialExpandedGroups = {},
  difficultyOrder = STANDARD_DIFFICULTY_ORDER,
  difficultyLabels = STANDARD_DIFFICULTY_LABELS,
  fallbackDifficulty = "MEDIUM",
  defaultGroupExpanded = true,
}: DifficultyQuestionListProps<T>) {
  return (
    <DifficultyGroupedList
      className={className}
      items={items}
      getDifficulty={getDifficulty}
      getItemKey={(item, index) => getItemKey(item) ?? index}
      initialExpandedGroups={initialExpandedGroups}
      defaultGroupExpanded={defaultGroupExpanded}
      difficultyOrder={difficultyOrder}
      difficultyLabels={difficultyLabels}
      fallbackDifficulty={fallbackDifficulty}
      emptyMessage={emptyMessage}
      renderItem={(item) => {
        const row = resolveRow(item);
        const key = String(getItemKey(item));

        return (
          <QuestionRow
            {...row}
            onClick={() => onItemClick?.(item)}
            onToggleComplete={() => {
              onToggleItemComplete?.(item, key);
            }}
          />
        );
      }}
    />
  );
}
