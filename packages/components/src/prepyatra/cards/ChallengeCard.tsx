import { challengesService } from "@tbe/services";
import type { Challenge } from "@tbe/types";
import React, { useState } from "react";
import { toast } from "sonner";

import {
  CalendarIcon,
  ClockIcon,
  HistoryIcon,
  PauseIcon,
  PlayIcon,
  Trash2Icon,
  TrendingUpIcon,
  TrophyIcon,
} from "../features/SVGIcons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface ChallengeCardProps {
  challenge: Challenge;
  onChallengeUpdated: () => void;
  onLogProgress: (challenge: Challenge) => void;
  onViewLogs?: (challenge: Challenge) => void;
}

export const ChallengeCard = ({
  challenge,
  onChallengeUpdated,
  onLogProgress,
  onViewLogs,
}: ChallengeCardProps) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-slate-50 text-slate-500 border-slate-200";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <PlayIcon className="w-2.5 h-2.5 fill-current" />
    ) : (
      <PauseIcon className="w-2.5 h-2.5 fill-current" />
    );
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Paused";
  };

  const calculateProgress = () => {
    return Math.round((challenge.currentDay / challenge.totalDays) * 100);
  };

  const calculateDaysRemaining = () => {
    return Math.max(0, challenge.totalDays - challenge.currentDay);
  };

  const handlePauseResume = async () => {
    setLoading(true);
    try {
      const newStatus = !challenge.isActive;
      await challengesService.update({
        challengeId: challenge._id,
        isActive: newStatus,
      });

      toast.success(
        `Challenge ${newStatus ? "resumed" : "paused"} successfully!`,
      );
      onChallengeUpdated();
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Failed to update challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await challengesService.delete(challenge._id);
      toast.success("Challenge deleted successfully!");
      onChallengeUpdated();
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Failed to delete challenge");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const progress = calculateProgress();
  const daysRemaining = calculateDaysRemaining();
  const isCompleted = challenge.currentDay >= challenge.totalDays;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col group justify-between">
      <div>
        {/* Header Title block */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="space-y-1">
            <h4 className="text-slate-800 font-bold text-sm leading-snug group-hover:text-primary transition-colors">
              {challenge.name}
            </h4>
            {challenge.category && (
              <span className="inline-block bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {challenge.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(
                challenge.isActive,
              )}`}
            >
              {getStatusIcon(challenge.isActive)}
              <span>{getStatusText(challenge.isActive)}</span>
            </span>

            {isCompleted && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <TrophyIcon className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                <span>Completed</span>
              </span>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={loading}
                  className="inline-flex items-center justify-center w-6 h-6 text-slate-400 hover:text-red-650 transition-all duration-200 active:scale-[0.96] rounded-md hover:bg-slate-50"
                  title="Delete Challenge"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-sm md:max-w-md mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-800 text-base font-bold">
                    Delete Challenge
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                    Are you sure you want to delete this challenge? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex flex-row gap-3 justify-end">
                  <AlertDialogCancel className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all duration-200">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all duration-200"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Description */}
        {challenge.description && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
            {challenge.description}
          </p>
        )}

        {/* Progress visualizer */}
        <div className="space-y-3.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-800">{progress}%</span>
          </div>

          {/* Custom gorgeous progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#ff8c8c] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
            <div>
              <div className="text-primary font-bold text-sm">
                {challenge.currentDay + 1}
              </div>
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Current Day
              </div>
            </div>
            <div>
              <div className="text-slate-700 font-bold text-sm">
                {daysRemaining}
              </div>
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Days Left
              </div>
            </div>
            <div>
              <div className="text-slate-700 font-bold text-sm">
                {challenge.totalDays}
              </div>
              <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Total Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date metadata & action footers */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-slate-300" />
            <span>Started: {formatDate(challenge.startDate)}</span>
          </div>
          {challenge.endDate && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-slate-300" />
              <span>Ended: {formatDate(challenge.endDate)}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {challenge.isActive && !isCompleted && (
            <button
              onClick={() => onLogProgress(challenge)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-primary text-white hover:bg-primary/95 rounded-lg text-[11px] font-semibold shadow-sm shadow-primary/10 transition-all duration-200 active:scale-[0.96]"
            >
              <TrendingUpIcon className="w-3.5 h-3.5" />
              <span>Log Progress</span>
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={handlePauseResume}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-semibold transition-all duration-200 active:scale-[0.96]"
            >
              {challenge.isActive ? (
                <>
                  <PauseIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Resume</span>
                </>
              )}
            </button>
          )}

          {onViewLogs && (
            <button
              onClick={() => onViewLogs(challenge)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-700 hover:text-primary rounded-lg text-[11px] font-semibold transition-all duration-200 active:scale-[0.96]"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Logs</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
