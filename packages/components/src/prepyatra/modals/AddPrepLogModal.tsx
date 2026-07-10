import { prepLogsService } from "@tbe/services";
import React, { useEffect, useState } from "react";
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

interface AddPrepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogAdded: () => void;
  mongoUserId: string;
  editLog?: {
    _id: string;
    title: string;
    description?: string;
    timeSpent: number;
  } | null;
}

export const AddPrepLogModal = ({
  isOpen,
  onClose,
  onLogAdded,
  mongoUserId,
  editLog,
}: AddPrepLogModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeSpent: "",
  });

  useEffect(() => {
    if (editLog) {
      setFormData({
        title: editLog.title || "",
        description: editLog.description || "",
        timeSpent: editLog.timeSpent.toString() || "",
      });
    } else {
      setFormData({ title: "", description: "", timeSpent: "" });
    }
  }, [editLog, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.timeSpent) {
      toast.error("Title and Time Spent are required");
      return;
    }
    setLoading(true);
    try {
      if (editLog) {
        await prepLogsService.update({
          title: formData.title,
          description: formData.description,
          timeSpent: Number(formData.timeSpent),
          prepLogId: editLog._id,
        });
      } else {
        await prepLogsService.create({
          title: formData.title,
          description: formData.description,
          timeSpent: Number(formData.timeSpent),
          userId: mongoUserId,
        });
      }
      toast.success(`Prep Log ${editLog ? "updated" : "added"} successfully!`);
      onLogAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[500px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            {editLog ? "Edit Prep Log" : "Add New Prep Log"}
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            {editLog
              ? "Update your existing log details."
              : "Log today's preparation effort."}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ModalLabel required>Title</ModalLabel>
            <ModalInput
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="E.g. Solved 3 Leetcode Mediums"
              required
            />
          </div>
          <div>
            <ModalLabel>Description</ModalLabel>
            <ModalTextarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Briefly describe what topics you prepared..."
              rows={3}
            />
          </div>
          <div>
            <ModalLabel required>Time Spent (in hours)</ModalLabel>
            <ModalInput
              type="number"
              step="any"
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timeSpent: e.target.value }))
              }
              placeholder="E.g. 1.5"
              required
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <OutlineButton type="button" onClick={onClose}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Saving..." : editLog ? "Update Log" : "Add Log"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPrepLogModal;
