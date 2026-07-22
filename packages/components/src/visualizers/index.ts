import type React from "react";

import BubbleSortVisualizer from "./BubbleSortVisualizer";
import MergeSortVisualizer from "./MergeSortVisualizer";
import QuickSortVisualizer from "./QuickSortVisualizer";
import SelectionSortVisualizer from "./SelectionSortVisualizer";

export const VISUALIZER_MAP: Record<string, React.ComponentType> = {
  "bubble-sort": BubbleSortVisualizer,
  "selection-sort": SelectionSortVisualizer,
  "quick-sort": QuickSortVisualizer,
  "merge-sort": MergeSortVisualizer,
};

export {
  BubbleSortVisualizer,
  MergeSortVisualizer,
  QuickSortVisualizer,
  SelectionSortVisualizer,
};
