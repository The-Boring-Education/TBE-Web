import { useCallback, useState } from "react";

export type ExpandableGroupsState = Record<string, boolean>;

/**
 * Collapsible section state for arbitrary group keys (difficulty, chapter, campus track, etc.).
 * Keys not present in state are treated as expanded when `defaultExpanded` is true.
 */
export function useExpandableGroups(initial: ExpandableGroupsState = {}): {
  expandedGroups: ExpandableGroupsState;
  toggleGroup: (groupKey: string) => void;
  isGroupExpanded: (groupKey: string, defaultExpanded?: boolean) => boolean;
} {
  const [expandedGroups, setExpandedGroups] = useState(initial);

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !(prev[groupKey] ?? true),
    }));
  }, []);

  const isGroupExpanded = useCallback(
    (groupKey: string, defaultExpanded = true) =>
      expandedGroups[groupKey] ?? defaultExpanded,
    [expandedGroups],
  );

  return { expandedGroups, toggleGroup, isGroupExpanded };
}
