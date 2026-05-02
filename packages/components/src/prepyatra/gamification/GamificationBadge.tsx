import { usePyGamification } from "@tbe/hooks";
import type { GamificationBadgeProps } from "@tbe/interface";
import { Star } from "lucide-react";

import LoadingSpinner from "../../common/LoadingSpinner";
import { Badge } from "../ui/badge";

export function GamificationBadge({
  userId,
  className = "",
}: GamificationBadgeProps) {
  const { points, currentLevel, loading } = usePyGamification(userId);

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 ${className}`}
      >
        <LoadingSpinner height={4} width={4} />
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 ${className}`}
    >
      <Star className="h-3 w-3" />
      <span className="font-semibold">{points}</span>
      <span className="text-xs opacity-75">L{currentLevel}</span>
    </Badge>
  );
}
