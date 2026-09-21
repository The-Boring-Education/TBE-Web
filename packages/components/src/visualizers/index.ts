import type React from "react";

import ArrayBasicsVisualizer from "./ArrayBasicsVisualizer";
import BinarySearchVisualizer from "./BinarySearchVisualizer";
import BubbleSortVisualizer from "./BubbleSortVisualizer";
import HashMapOperationsVisualizer from "./HashMapOperationsVisualizer";
import LinkedListBasicsVisualizer from "./LinkedListBasicsVisualizer";
import MergeSortVisualizer from "./MergeSortVisualizer";
import QuickSortVisualizer from "./QuickSortVisualizer";
import RecursionTreeVisualizer from "./RecursionTreeVisualizer";
import SelectionSortVisualizer from "./SelectionSortVisualizer";
import SlidingWindowVisualizer from "./SlidingWindowVisualizer";
import StackOperationsVisualizer from "./StackOperationsVisualizer";
import StringBasicsVisualizer from "./StringBasicsVisualizer";
import TwoPointersVisualizer from "./TwoPointersVisualizer";

export const VISUALIZER_MAP: Record<string, React.ComponentType> = {
  "bubble-sort": BubbleSortVisualizer,
  "selection-sort": SelectionSortVisualizer,
  "quick-sort": QuickSortVisualizer,
  "merge-sort": MergeSortVisualizer,
  "array-basics": ArrayBasicsVisualizer,
  "string-basics": StringBasicsVisualizer,
  "hashmap-operations": HashMapOperationsVisualizer,
  "two-pointers": TwoPointersVisualizer,
  "sliding-window": SlidingWindowVisualizer,
  "binary-search": BinarySearchVisualizer,
  "recursion-tree": RecursionTreeVisualizer,
  "linked-list-basics": LinkedListBasicsVisualizer,
  "stack-operations": StackOperationsVisualizer,
};

export {
  ArrayBasicsVisualizer,
  BinarySearchVisualizer,
  BubbleSortVisualizer,
  HashMapOperationsVisualizer,
  LinkedListBasicsVisualizer,
  MergeSortVisualizer,
  QuickSortVisualizer,
  RecursionTreeVisualizer,
  SelectionSortVisualizer,
  SlidingWindowVisualizer,
  StackOperationsVisualizer,
  StringBasicsVisualizer,
  TwoPointersVisualizer,
};
