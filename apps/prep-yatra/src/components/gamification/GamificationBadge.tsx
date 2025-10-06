import {Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {useGamification} from "@/hooks/usePyGamification";
import {GamificationBadgeProps} from "@/interfaces/components";

export function GamificationBadge({userId, className = ""}: GamificationBadgeProps) {
    const {points, currentLevel, loading} = useGamification(userId);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 ${className}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
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