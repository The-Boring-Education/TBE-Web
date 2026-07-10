import { prepLogsService } from "@tbe/services";
import React, { useState } from "react";
import { toast } from "sonner";

import AddPrepLogModal from "../modals/AddPrepLogModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { ClockIcon, EditIcon, Trash2Icon } from "./SVGIcons";

type PrepLog = {
  _id: string;
  title: string;
  description?: string;
  timeSpent: number;
  mentorFeedback?: string;
  createdAt: string;
};

interface PrepLogsListProps {
  logs: PrepLog[];
  onLogUpdated: () => void;
  onLogDeleted: (deletedLogId: string) => void;
  mongoUserId: string;
}

export const PrepLogsList = ({
  logs,
  onLogUpdated,
  onLogDeleted,
  mongoUserId,
}: PrepLogsListProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<PrepLog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const logsToShow = sortedLogs.slice(0, visibleCount);
  const hasMore = sortedLogs.length > visibleCount;

  const openEditModal = (log: PrepLog) => {
    setSelectedLog(log);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedLog(null);
    onLogUpdated();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      await prepLogsService.delete(deleteId);
      toast.success("Your prep log was successfully deleted.");
      onLogDeleted(deleteId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete log",
      );
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (logs.length === 0) {
    return (
      <div className="w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 text-center mt-2">
        <span className="text-3xl mb-2.5 block select-none">📝</span>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          No Prep Logs Yet
        </h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          Start documenting your daily preparation progress by adding your first
          prep log above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {logsToShow.map((log) => (
          <div
            key={log._id}
            className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group overflow-hidden"
          >
            {/* Header info */}
            <div className="p-4 border-b border-slate-100/80 flex-1">
              <h4 className="text-slate-850 font-bold text-sm mb-1 text-slate-800 line-clamp-1 leading-snug">
                {log.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3 text-slate-400" />
                  <span>
                    {log.timeSpent} {log.timeSpent === 1 ? "hr" : "hrs"}
                  </span>
                </span>
              </div>

              <p className="text-slate-500 text-xs mt-3 leading-relaxed break-words whitespace-pre-wrap line-clamp-4">
                {log.description || "No description provided."}
              </p>
            </div>

            {/* Mentor feedback or notes */}
            {log.mentorFeedback && (
              <div className="mx-4 mt-3 bg-purple-50/70 border border-purple-100 text-purple-900 rounded-xl p-3 text-xs leading-relaxed">
                <div className="font-bold text-[10px] uppercase tracking-wider text-purple-750 mb-1 flex items-center gap-1.5">
                  <span className="select-none">🎓</span>
                  <span>Mentor Feedback</span>
                </div>
                <p className="italic text-purple-800 whitespace-pre-wrap line-clamp-3">
                  {log.mentorFeedback}
                </p>
              </div>
            )}

            {/* Actions panel */}
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 justify-end shrink-0">
              <button
                onClick={() => openEditModal(log)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-650 hover:text-primary rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.96]"
              >
                <EditIcon className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    onClick={() => setDeleteId(log._id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-650 hover:text-red-600 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.96]"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-2xl p-6 max-w-sm md:max-w-md mx-auto">
                  <AlertDialogHeader>
                    <h3 className="text-base font-bold text-slate-800">
                      Delete Prep Log
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                      Are you sure you want to delete this prep log? This action
                      cannot be undone.
                    </p>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 flex flex-row gap-3 justify-end">
                    <AlertDialogCancel className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all duration-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="px-4 py-2 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-red-600/10 transition-all duration-200"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center gap-3 pt-2">
        {visibleCount > 6 && (
          <button
            onClick={() => setVisibleCount(6)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.96]"
          >
            Show Less
          </button>
        )}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.96]"
          >
            Show More Logs
          </button>
        )}
      </div>

      <AddPrepLogModal
        key={`edit-prep-log-${selectedLog?._id || "new"}`}
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onLogAdded={onLogUpdated}
        mongoUserId={mongoUserId}
        editLog={selectedLog}
      />
    </div>
  );
};

export default PrepLogsList;
