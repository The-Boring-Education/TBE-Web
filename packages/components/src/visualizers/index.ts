import type React from "react";

import ArrayBasicsVisualizer from "./ArrayBasicsVisualizer";
import BinarySearchVisualizer from "./BinarySearchVisualizer";
import BubbleSortVisualizer from "./BubbleSortVisualizer";
import HashMapOperationsVisualizer from "./HashMapOperationsVisualizer";
import LinkedListBasicsVisualizer from "./LinkedListBasicsVisualizer";
import RecursionTreeVisualizer from "./RecursionTreeVisualizer";
import SlidingWindowVisualizer from "./SlidingWindowVisualizer";
import StackOperationsVisualizer from "./StackOperationsVisualizer";
import StringBasicsVisualizer from "./StringBasicsVisualizer";
import TwoPointersVisualizer from "./TwoPointersVisualizer";

export const VISUALIZER_MAP: Record<string, React.ComponentType> = {
  "bubble-sort": BubbleSortVisualizer,
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
  RecursionTreeVisualizer,
  SlidingWindowVisualizer,
  StackOperationsVisualizer,
  StringBasicsVisualizer,
  TwoPointersVisualizer,
};
