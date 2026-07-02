import { Loader, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { useGetSession, useUpdateSessionSheet } from "@/api/interviewAgentsApi";
import {
  useInterviewSheet,
  useUpdateInterviewSheet,
} from "@/api/interviewPrepApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Constants for Agents API updates
const AGENTS_API_BASE =
  (import.meta as any).env?.VITE_AGENTS_API_BASE ||
  "http://localhost:8000/api/v1";

interface InterviewSheetReviewerProps {
  id: string | null;
  type: "session" | "sheet" | null;
  onClose: () => void;
}

const InterviewSheetReviewer = ({
  id,
  type,
  onClose,
}: InterviewSheetReviewerProps) => {
  const { toast } = useToast();
  const [reviewJson, setReviewJson] = useState("");
  const [isReviewJsonValid, setIsReviewJsonValid] = useState(true);

  // --- Data Fetching ---
  const {
    data: dbData,
    isLoading: dbLoading,
    refetch: refetchDb,
  } = useInterviewSheet(type === "sheet" && id ? id : undefined);

  const {
    data: sessionData,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useGetSession(type === "session" && id ? id : "");

  const isLoading = type === "sheet" ? dbLoading : sessionLoading;
  const currentData =
    type === "sheet"
      ? dbData
      : sessionData?.sheet_data || sessionData?.sheetData || sessionData;

  // --- Mutations ---
  const updateInterviewSheetMutation = useUpdateInterviewSheet();
  const updateSessionSheetMutation = useUpdateSessionSheet();

  // Sync data to editor when loaded
  useEffect(() => {
    if (currentData && !isLoading) {
      setReviewJson(JSON.stringify(currentData, null, 2));
      setIsReviewJsonValid(true);
    }
  }, [currentData, isLoading]);

  const handleSave = () => {
    if (!id) return;

    try {
      const data = JSON.parse(reviewJson);
      if (type === "sheet") {
        updateInterviewSheetMutation.mutate(
          {
            sheetId: id,
            updatedData: data,
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Sheet updated successfully",
              });
              onClose();
            },
            onError: (error: Error) => {
              toast({
                title: "Error",
                description: error?.message || "Failed to update sheet",
                variant: "destructive",
              });
            },
          },
        );
      } else if (type === "session") {
        updateSessionSheetMutation.mutate(
          {
            sessionId: id,
            sheetData: data,
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Session data updated successfully",
              });
              onClose();
            },
            onError: (error: Error) => {
              toast({
                title: "Error",
                description: error?.message || "Failed to update session",
                variant: "destructive",
              });
            },
          },
        );
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Invalid JSON data",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (type === "sheet") {
      refetchDb();
    } else {
      // For session, we use the direct axios call for reset if needed,
      // but refetchSession should work if query keys are consistent
      const response = await refetchSession();
      const resetData =
        response.data?.sheet_data || response.data?.sheetData || response.data;
      if (resetData) {
        setReviewJson(JSON.stringify(resetData, null, 2));
        setIsReviewJsonValid(true);
        toast({
          title: "Reset Successful",
          description: "JSON has been reset to latest data.",
        });
      }
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(reviewJson);
      setReviewJson(JSON.stringify(parsed, null, 2));
      setIsReviewJsonValid(true);
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Cannot format invalid JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Review {type === "sheet" ? "Database Sheet" : "Session"} JSON
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reset to fetched data"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleFormat}>
                Format JSON
              </Button>
            </div>
            <div className="flex-1 relative">
              <Textarea
                value={reviewJson}
                onChange={(e) => {
                  setReviewJson(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setIsReviewJsonValid(true);
                  } catch (e) {
                    setIsReviewJsonValid(false);
                  }
                }}
                className={`font-mono text-sm h-full w-full resize-none ${
                  !isReviewJsonValid ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Paste or edit JSON here..."
              />
              {!isReviewJsonValid && (
                <p className="text-xs text-red-500 mt-1 absolute bottom-2 left-2 bg-white/80 px-1">
                  Invalid JSON
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={
              updateInterviewSheetMutation.isPending ||
              updateSessionSheetMutation.isPending
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !isReviewJsonValid ||
              updateInterviewSheetMutation.isPending ||
              updateSessionSheetMutation.isPending ||
              isLoading
            }
          >
            {updateInterviewSheetMutation.isPending ||
            updateSessionSheetMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSheetReviewer;
