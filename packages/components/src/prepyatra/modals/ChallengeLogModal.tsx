import { challengesService } from "@tbe/services";
import type { Challenge } from "@tbe/types";
import React, { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Helper components
const ModalLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <label
    className="block font-medium mb-1.5"
    style={{ fontSize: "13px", color: "#111111" }}
  >
    {children} {required && <span className="text-[#e8372c]">*</span>}
  </label>
);

const ModalInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] placeholder:text-[#8a8a8a] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
  />
));
ModalInput.displayName = "ModalInput";

const ModalTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] placeholder:text-[#8a8a8a] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10 resize-none"
  />
));
ModalTextarea.displayName = "ModalTextarea";

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-lg text-[13px]"
    style={{ backgroundColor: "#e8372c" }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d42e23")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e8372c")}
  >
    {children}
  </button>
);

const OutlineButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 font-medium transition-colors duration-200 border border-[#e8e8e8] hover:bg-[#f0f0f0] rounded-lg text-[13px]"
    style={{ backgroundColor: "#ffffff", color: "#111111" }}
  >
    {children}
  </button>
);

interface ChallengeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgressLogged: () => void;
  challenge: Challenge;
  userId: string;
}

export const ChallengeLogModal = ({
  isOpen,
  onClose,
  onProgressLogged,
  challenge,
  userId,
}: ChallengeLogModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    logNote: "",
    timeSpent: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.timeSpent) {
      toast.error("Time spent is required");
      return;
    }
    setLoading(true);
    try {
      await challengesService.createLog({
        challengeId: challenge._id,
        day: challenge.currentDay + 1,
        progressText: formData.logNote,
        hoursSpent: Number(formData.timeSpent),
        nextGoals: [],
      });

      toast.success("Progress logged successfully!");
      onProgressLogged();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to log progress",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[480px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            Log Challenge Progress
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            Record details for Day {challenge.currentDay + 1} of your challenge.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ModalLabel required>Time Spent (Hours)</ModalLabel>
            <ModalInput
              type="number"
              step="any"
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timeSpent: e.target.value }))
              }
              placeholder="E.g. 2.5"
              required
            />
          </div>
          <div>
            <ModalLabel>Daily Work Summary / Note</ModalLabel>
            <ModalTextarea
              value={formData.logNote}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logNote: e.target.value }))
              }
              placeholder="What tasks or topics did you complete today?"
              rows={3}
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <OutlineButton type="button" onClick={onClose}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Logging..." : "Log Progress"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeLogModal;
