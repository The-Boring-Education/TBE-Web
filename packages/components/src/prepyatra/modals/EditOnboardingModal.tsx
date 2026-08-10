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
  <label className="block font-semibold mb-1 text-xs text-[#334155]">
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
    className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 transition-all outline-none rounded-md text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#e8372c] focus:ring-2 focus:ring-[#e8372c]/15"
  />
));
ModalInput.displayName = "ModalInput";

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-1.5 text-xs font-bold text-white bg-[#e8372c] hover:bg-[#d42e23] rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
  >
    {children}
  </button>
);

const OutlineButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-1.5 text-xs font-semibold text-[#0f172a] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] rounded-lg transition-all cursor-pointer"
  >
    {children}
  </button>
);

interface UserProfile {
  _id?: string;
  name?: string;
  userName?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  image?: string;
  userSkills?: string[];
  userSkillsLastUpdated?: string;
  prepYatra?: {
    experienceLevel?: string;
    goal?: string;
    skills?: string[];
    targetCompanies?: string[];
    preferences?: {
      focusAreas?: string[];
      interviewCategories?: string[];
    };
  };
  createdAt?: string;
  occupation?: string;
  purpose?: string[];
}

interface EditOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentData?: UserProfile;
  onUpdate: () => void;
}

export const EditOnboardingModal = ({
  isOpen,
  onClose,
  userId,
  currentData,
  onUpdate,
}: EditOnboardingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    experienceLevel: "fresher",
    goal: "SWITCH_CAREER",
    occupation: "TECH_STUDENT",
    purpose: [] as string[],
    preferredCategories: [] as string[],
    targetCompanies: [] as string[],
    linkedInUrl: "",
    githubUrl: "",
    leetCodeUrl: "",
  });

  const occupationOptions = [
    { value: "TECH_STUDENT", label: "Tech Student" },
    { value: "NON_TECH_STUDENT", label: "Non-Tech Student" },
    { value: "WORKING_PROFESSIONAL", label: "Working Professional" },
    { value: "STUDENT", label: "Student" },
    { value: "FREELANCER", label: "Freelancer" },
    { value: "OTHER", label: "Other" },
  ];

  const purposeOptions = [
    { value: "LEARNING_TECH", label: "Learning Tech 📚" },
    { value: "BUILDING_PROJECTS", label: "Building Projects 🛠️" },
    { value: "INTERVIEW_PREP", label: "Interview Prep 🎯" },
    { value: "JOB_SEARCH", label: "Job Search 💼" },
  ];

  const experienceOptions = [
    { value: "fresher", label: "0-1 years (Fresher) 🌱" },
    { value: "junior", label: "1-3 years (Junior) 💼" },
    { value: "mid", label: "3-5 years (Mid-level) 🚀" },
    { value: "senior", label: "5+ years (Senior) 👔" },
  ];

  const goalOptions = [
    { value: "GET_JOB", label: "3 Months (Quick prep) ⚡" },
    { value: "SWITCH_CAREER", label: "6 Months (Comprehensive prep) 🎯" },
    { value: "LEARN_NEW_SKILL", label: "1 Year (Long-term planning) 🌟" },
  ];

  const companyOptions = [
    { value: "STARTUP", label: "Startups 🚀" },
    { value: "MID_SIZE", label: "Mid-size Companies 🏢" },
    { value: "MNC", label: "MNCs 🌍" },
    { value: "FAANG", label: "FAANG / Top Tier ⭐" },
  ];

  const interviewCategoryOptions = [
    { value: "MNC", label: "MNC Interview Prep 🏢" },
    { value: "MERN", label: "MERN Stack Prep ⚛️" },
    { value: "CollegePlacement", label: "College Placement 🎓" },
    { value: "DSA", label: "DSA Focus 🧠" },
    { value: "SystemDesign", label: "System Design 🏗️" },
    { value: "GeneralTech", label: "General Tech 💻" },
  ];

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name || "",
        userName: currentData.userName || "",
        experienceLevel: currentData.prepYatra?.experienceLevel || "fresher",
        goal: currentData.prepYatra?.goal || "SWITCH_CAREER",
        occupation: currentData.occupation || "TECH_STUDENT",
        purpose: currentData.purpose || [],
        preferredCategories:
          currentData.prepYatra?.preferences?.interviewCategories || [],
        targetCompanies: currentData.prepYatra?.targetCompanies || [],
        linkedInUrl: currentData.linkedInUrl || "",
        githubUrl: currentData.githubUrl || "",
        leetCodeUrl: currentData.leetCodeUrl || "",
      });
    }
  }, [currentData, isOpen]);

  const withProtocol = (url: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.userName) {
      toast.error("Name and Username are required");
      return;
    }
    if (formData.targetCompanies.length === 0) {
      toast.error("Please select at least one target company category");
      return;
    }
    if (formData.preferredCategories.length === 0) {
      toast.error("Please select at least one interview focus category");
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        userId,
        name: formData.name,
        username: formData.userName,
        goal: formData.goal,
        experienceLevel: formData.experienceLevel,
        occupation: formData.occupation,
        purpose: formData.purpose,
        targetCompanies: formData.targetCompanies,
        preferredCategories: formData.preferredCategories,
        linkedInUrl: withProtocol(formData.linkedInUrl),
        githubUrl: withProtocol(formData.githubUrl),
        leetCodeUrl: withProtocol(formData.leetCodeUrl),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      const result = await response.json();

      if (result.status) {
        toast.success("Profile details updated successfully!");
        onUpdate();
        onClose();
      } else {
        throw new Error(
          result.message || "Failed to update onboarding details",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl border border-[#cbd5e1] shadow-2xl p-5 sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-bold text-[#0f172a]">
            Edit Onboarding Details
          </DialogTitle>
          <p className="mt-0.5 text-xs text-[#64748b]">
            Update your profile info, target goals, and company focus.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <ModalLabel required>Display Name</ModalLabel>
              <ModalInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="E.g. John Doe"
                required
              />
            </div>
            <div>
              <ModalLabel required>Username</ModalLabel>
              <ModalInput
                type="text"
                value={formData.userName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userName: e.target.value }))
                }
                placeholder="E.g. johndoe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <ModalLabel>Occupation</ModalLabel>
              <select
                value={formData.occupation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    occupation: e.target.value,
                  }))
                }
                className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 outline-none rounded-md text-xs text-[#0f172a] focus:border-[#e8372c] focus:ring-2 focus:ring-[#e8372c]/15 transition-all"
              >
                {occupationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <ModalLabel>Experience Level</ModalLabel>
              <select
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experienceLevel: e.target.value,
                  }))
                }
                className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 outline-none rounded-md text-xs text-[#0f172a] focus:border-[#e8372c] focus:ring-2 focus:ring-[#e8372c]/15 transition-all"
              >
                {experienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <ModalLabel>Target Goal</ModalLabel>
            <select
              value={formData.goal}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, goal: e.target.value }))
              }
              className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 outline-none rounded-md text-xs text-[#0f172a] focus:border-[#e8372c] focus:ring-2 focus:ring-[#e8372c]/15 transition-all"
            >
              {goalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <ModalLabel>LinkedIn</ModalLabel>
              <ModalInput
                type="text"
                value={formData.linkedInUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    linkedInUrl: e.target.value,
                  }))
                }
                placeholder="linkedin.com/in/..."
              />
            </div>
            <div>
              <ModalLabel>GitHub</ModalLabel>
              <ModalInput
                type="text"
                value={formData.githubUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    githubUrl: e.target.value,
                  }))
                }
                placeholder="github.com/..."
              />
            </div>
            <div>
              <ModalLabel>LeetCode</ModalLabel>
              <ModalInput
                type="text"
                value={formData.leetCodeUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leetCodeUrl: e.target.value,
                  }))
                }
                placeholder="leetcode.com/..."
              />
            </div>
          </div>

          <div>
            <ModalLabel>Purpose</ModalLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {purposeOptions.map((opt) => {
                const isSelected = formData.purpose.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        const current = prev.purpose;
                        const updated = isSelected
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, purpose: updated };
                      });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#e8372c] bg-[#fff0ef] text-[#e8372c]"
                        : "border-[#cbd5e1] bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <ModalLabel required>Target Companies</ModalLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {companyOptions.map((opt) => {
                const isSelected = formData.targetCompanies.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        const current = prev.targetCompanies;
                        const updated = isSelected
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, targetCompanies: updated };
                      });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#e8372c] bg-[#fff0ef] text-[#e8372c]"
                        : "border-[#cbd5e1] bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <ModalLabel required>Interview Focus</ModalLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {interviewCategoryOptions.map((opt) => {
                const isSelected = formData.preferredCategories.includes(
                  opt.value,
                );
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => {
                        const current = prev.preferredCategories;
                        const updated = isSelected
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, preferredCategories: updated };
                      });
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#e8372c] bg-[#fff0ef] text-[#e8372c]"
                        : "border-[#cbd5e1] bg-[#f8fafc] text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-3 border-t border-[#e2e8f0] mt-2">
            <OutlineButton type="button" onClick={onClose}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOnboardingModal;
