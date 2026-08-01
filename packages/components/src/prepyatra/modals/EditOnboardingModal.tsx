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
      <DialogContent className="bg-white rounded-2xl border border-[#e8e8e8] shadow-xl p-6 sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[17px] font-semibold text-[#111111]">
            Edit Onboarding Details
          </DialogTitle>
          <p className="mt-1" style={{ fontSize: "13px", color: "#8a8a8a" }}>
            Modify your targeted goals, experience levels, and company
            preferences.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
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
                className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
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
              className="w-full bg-white border border-[#e8e8e8] px-3.5 py-2 transition-all duration-200 outline-none rounded-md text-[13px] text-[#111111] focus:border-[#e8372c] focus:ring-1 focus:ring-[#e8372c]/10"
            >
              {goalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <ModalLabel>LinkedIn URL</ModalLabel>
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
              <ModalLabel>GitHub URL</ModalLabel>
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
              <ModalLabel>LeetCode URL</ModalLabel>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {purposeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-[#e8e8e8] hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.purpose.includes(opt.value)}
                    onChange={() => {
                      setFormData((prev) => {
                        const current = prev.purpose;
                        const updated = current.includes(opt.value)
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, purpose: updated };
                      });
                    }}
                    className="accent-[#e8372c] h-4 w-4"
                  />
                  <span style={{ fontSize: "12px", color: "#111111" }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <ModalLabel required>Target Companies</ModalLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {companyOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-[#e8e8e8] hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.targetCompanies.includes(opt.value)}
                    onChange={() => {
                      setFormData((prev) => {
                        const current = prev.targetCompanies;
                        const updated = current.includes(opt.value)
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, targetCompanies: updated };
                      });
                    }}
                    className="accent-[#e8372c] h-4 w-4"
                  />
                  <span style={{ fontSize: "12px", color: "#111111" }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <ModalLabel required>Interview Category Focus</ModalLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {interviewCategoryOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-[#e8e8e8] hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredCategories.includes(opt.value)}
                    onChange={() => {
                      setFormData((prev) => {
                        const current = prev.preferredCategories;
                        const updated = current.includes(opt.value)
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        return { ...prev, preferredCategories: updated };
                      });
                    }}
                    className="accent-[#e8372c] h-4 w-4"
                  />
                  <span style={{ fontSize: "12px", color: "#111111" }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-[#e8e8e8]">
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
