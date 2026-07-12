import type { PredefinedChallengeTemplate } from "@tbe/constants";
import { PREDEFINED_CHALLENGES } from "@tbe/constants";
import { challengesService } from "@tbe/services";
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

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
  userId: string;
}

export const CreateChallengeModal = ({
  isOpen,
  onClose,
  onChallengeCreated,
  userId,
}: CreateChallengeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"select" | "custom">("select");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PredefinedChallengeTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalDays: "7",
    category: "Coding",
  });

  const categories = [
    "Coding",
    "System Design",
    "Behavioral",
    "Aptitude",
    "Frontend",
    "Backend",
    "DevOps",
    "General Prep",
  ];

  useEffect(() => {
    if (isOpen) {
      setMode("select");
      setSelectedTemplate(null);
      setFormData({
        name: "",
        description: "",
        totalDays: "7",
        category: "Coding",
      });
    }
  }, [isOpen]);

  const handleSelectTemplate = (template: PredefinedChallengeTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      totalDays: template.totalDays.toString(),
      category: template.category || "Coding",
    });
    setMode("custom"); // Transition to form config
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.totalDays) {
      toast.error("Name and duration are required");
      return;
    }
    setLoading(true);
    try {
      await challengesService.create({
        user: userId,
        name: formData.name,
        description: formData.description,
        totalDays: Number(formData.totalDays),
        category: formData.category,
        predefinedType: selectedTemplate?.id || undefined,
      });
      toast.success("Prep challenge started successfully!");
      onChallengeCreated();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start challenge",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            {mode === "select"
              ? "Choose a Prep Challenge"
              : "Configure Your Challenge"}
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            {mode === "select"
              ? "Select an interview prep track or build a fully custom challenge."
              : "Customize the duration and specifics of your challenge."}
          </p>
        </DialogHeader>

        {mode === "select" ? (
          <div className="space-y-4">
            {/* Predefined templates */}
            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {PREDEFINED_CHALLENGES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-[#e8e8e8] hover:border-[#e8372c]/40 hover:bg-[#fff0ef]/20 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-[13px] text-[#111111] group-hover:text-[#e8372c]">
                      {tmpl.name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        backgroundColor: "#f0f0f0",
                        color: "#111111",
                      }}
                      className="px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {tmpl.totalDays} Days
                    </span>
                  </div>
                  <p className="mt-1.5 text-[#8a8a8a] text-[12px] leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom CTA */}
            <div className="pt-3 border-t border-[#e8e8e8] flex justify-between items-center">
              <span style={{ fontSize: "12px", color: "#8a8a8a" }}>
                Want a fully tailored prep plan?
              </span>
              <PrimaryButton onClick={() => setMode("custom")}>
                Create Custom Challenge
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <ModalLabel required>Challenge Name</ModalLabel>
              <ModalInput
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="E.g. LeetCode 75 Study Plan"
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
                placeholder="Describe what tasks you'll accomplish daily..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ModalLabel required>Duration (Days)</ModalLabel>
                <ModalInput
                  type="number"
                  min="1"
                  max="100"
                  value={formData.totalDays}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalDays: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <ModalLabel>Category</ModalLabel>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-[#e8e8e8]">
              {selectedTemplate ? (
                <OutlineButton
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setMode("select");
                  }}
                >
                  Back to Tracks
                </OutlineButton>
              ) : (
                <OutlineButton type="button" onClick={() => setMode("select")}>
                  Back
                </OutlineButton>
              )}
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? "Starting..." : "Start Challenge"}
              </PrimaryButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;
