import { ANALYTICS_EVENTS } from "@tbe/constants";
import { useToast } from "@tbe/hooks";
import { trackEvent } from "@tbe/utils";
import { AlertTriangle, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userSkills: string[];
  onSkillsUpdated: (skills: string[]) => void;
}

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Go",
  "Python",
  "AWS",
  "Docker",
  "Next.js",
  "Postgres",
  "MongoDB",
];

export const AddSkillsModal = ({
  isOpen,
  onClose,
  userId,
  userSkills,
  onSkillsUpdated,
}: AddSkillsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setSkillsList(userSkills || []);
  }, [userSkills, isOpen]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = inputValue.trim();
    if (!cleanSkill) return;
    if (skillsList.some((s) => s.toLowerCase() === cleanSkill.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userSkills: [skill] }),
      });
      const result = await res.json();
      if (result.status) {
        const updatedSkills = [...skills, skill];
        setSkills(updatedSkills);
        setInputValue("");
        toast({
          title: "Skill added!",
          description: `${skill} added to your stack.`,
        });
        try {
          trackEvent(ANALYTICS_EVENTS.SKILL_ADD, { category: "skills", skill });
        } catch { }
        if (onSkillsUpdated) {
          onSkillsUpdated(updatedSkills);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add skill.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add skill.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    if (removing) return;
    setRemoving(skill);
    try {
      const res = await fetch(`${NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skill }),
      });
      const result = await res.json();
      if (result.status) {
        const updatedSkills = skills.filter((s) => s !== skill);
        setSkills(updatedSkills);
        toast({
          title: "Skill removed",
          description: `${skill} removed from your stack.`,
        });
        try {
          trackEvent(ANALYTICS_EVENTS.SKILL_REMOVE, {
            category: "skills",
            skill,
          });
        } catch { }
        if (onSkillsUpdated) {
          onSkillsUpdated(updatedSkills);
        }
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const addedSkills = skillsList.filter((s) => !userSkills.includes(s));
      const removedSkills = userSkills.filter((s) => !skillsList.includes(s));

      const promises = [];

      if (addedSkills.length > 0) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, userSkills: addedSkills }),
          }).then((res) => res.json()),
        );
      }

      for (const skill of removedSkills) {
        promises.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/prepyatra/userskills`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, skill }),
          }).then((res) => res.json()),
        );
      }

      await Promise.all(promises);
      toast.success("Tech stack saved successfully!");
      onSkillsUpdated(skillsList);
      onClose();
    } catch {
      toast.error("Failed to save tech stack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[480px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            Build Your Tech Stack
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            Add programming languages, frameworks, or developer tools you know.
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Custom Input */}
          <div>
            <ModalLabel>Add a Skill</ModalLabel>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <div className="flex-1">
                <ModalInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="E.g. Rust, Kubernetes, Vue"
                />
              </div>
              <PrimaryButton type="submit">Add</PrimaryButton>
            </form>
          </div>

          {/* Prebuilt Quick Add Capsules */}
          <div>
            <ModalLabel>Quick Add Popular Skills</ModalLabel>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = skillsList.some(
                  (s) => s.toLowerCase() === skill.toLowerCase(),
                );
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleTogglePrebuiltSkill(skill)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 active:scale-[0.97]"
                    style={{
                      backgroundColor: isSelected ? "#fff0ef" : "#ffffff",
                      color: isSelected ? "#e8372c" : "#555555",
                      borderColor: isSelected ? "#e8372c" : "#e8e8e8",
                    }}
                  >
                    {skill} {isSelected ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current stack display */}
          <div>
            <ModalLabel>My Tech Stack ({skillsList.length})</ModalLabel>
            {skillsList.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-[#e8e8e8] rounded-xl bg-slate-50/30">
                <p
                  style={{ fontSize: "12px", color: "#8a8a8a" }}
                  className="italic"
                >
                  No skills in stack yet. Use the fields above to add!
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2.5 border border-[#e8e8e8] rounded-xl bg-slate-50/50">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] bg-white border border-[#e8e8e8] text-[#111111] font-semibold shadow-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#8a8a8a] hover:text-[#e8372c] font-bold text-[13px] ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-3 border-t border-[#e8e8e8]">
            <OutlineButton type="button" onClick={onClose}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Stack"}
            </PrimaryButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillsModal;
