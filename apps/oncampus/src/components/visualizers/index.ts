import type React from "react";

import BubbleSortVisualizer from "./BubbleSortVisualizer";

export const VISUALIZER_MAP: Record<string, React.ComponentType> = {
  "bubble-sort": BubbleSortVisualizer,
};
