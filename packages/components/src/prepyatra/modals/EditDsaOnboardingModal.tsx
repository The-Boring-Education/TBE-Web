import {
  DSA_EXPERIENCE_LEVELS,
  DSA_GOALS,
  DSA_TIMELINES,
} from "@tbe/constants";
import { cn, sendRequest } from "@tbe/utils";
import { ExternalLink, Github, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/useAuth";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useToast } from "../ui/use-toast";

type DsaGoal = (typeof DSA_GOALS)[number]["value"];
type DsaTimeline = (typeof DSA_TIMELINES)[number]["value"];
type DsaExperience = (typeof DSA_EXPERIENCE_LEVELS)[number]["value"];

interface DsaFormData {
  name: string;
  username: string;
  linkedInUrl: string;
  githubUrl: string;
  leetCodeUrl: string;
  goal: DsaGoal;
  timeline: DsaTimeline;
  experienceLevel: DsaExperience;
  preferredLanguage: string;
}

interface CurrentDsaProfileData {
  name?: string;
  userName?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  dsaYatra?: {
    target?: DsaGoal;
    timeline?: DsaTimeline;
    experienceLevel?: DsaExperience;
    preferredLanguage?: string;
  };
}

interface EditDsaOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentData?: CurrentDsaProfileData | null;
  userId: string;
}

const EditDsaOnboardingModal: React.FC<EditDsaOnboardingModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentData,
  userId,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<DsaFormData>({
    name: "",
    username: "",
    linkedInUrl: "",
    githubUrl: "",
    leetCodeUrl: "",
    goal: "Product-based" as DsaGoal,
    timeline: "6Months" as DsaTimeline,
    experienceLevel: "Fresher (0-1 yr)" as DsaExperience,
    preferredLanguage: "C++",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name || user?.name || "",
        username: currentData.userName || user?.email?.split("@")[0] || "",
        linkedInUrl: currentData.linkedInUrl || "",
        githubUrl: currentData.githubUrl || "",
        leetCodeUrl: currentData.leetCodeUrl || "",
        goal: (currentData.dsaYatra?.target || "Product-based") as DsaGoal,
        timeline: (currentData.dsaYatra?.timeline || "6Months") as DsaTimeline,
        experienceLevel: (currentData.dsaYatra?.experienceLevel ||
          "Fresher (0-1 yr)") as DsaExperience,
        preferredLanguage: currentData.dsaYatra?.preferredLanguage || "C++",
      });
    }
  }, [currentData, user]);

  const handleInputChange = <K extends keyof DsaFormData>(
    field: K,
    value: DsaFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.username) {
      toast({
        title: "Validation Error",
        description: "Name and Username are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        userId,
        name: formData.name,
        username: formData.username,
        target: formData.goal,
        timeline: formData.timeline,
        experienceLevel: formData.experienceLevel,
        preferredLanguage: formData.preferredLanguage,
        linkedInUrl: formData.linkedInUrl,
        githubUrl: formData.githubUrl,
        leetCodeUrl: formData.leetCodeUrl,
      };

      const result = await sendRequest({
        method: "POST",
        url: "/dsayatra/onboarding",
        body: requestBody,
      });

      if (result.status) {
        toast({
          title: "Success!",
          description: "DSA journey preferences updated successfully.",
        });
        onUpdate();
        onClose();
      } else {
        throw new Error(result.message || "Failed to update details");
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto border-[#2a2a2a] bg-[#0f0f0f] text-[#e0e0e0] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-[#ff5757] text-xl font-semibold">
            Edit Goal & DSA Preferences
          </DialogTitle>
          <DialogDescription className="text-center text-[#8a8a8a] text-sm">
            Update your profile details and roadmap so your prep stays aligned.
          </DialogDescription>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1 h-1 rounded-full bg-[#FF5757]" />
            <div className="w-1 h-1 rounded-full bg-[#FF5757]/70" />
            <div className="w-1 h-1 rounded-full bg-[#FF5757]/40" />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#8a8a8a]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-sm focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#8a8a8a]">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-sm focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">
              Social Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#8a8a8a] flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#FF5757]" /> LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedInUrl}
                  onChange={(e) =>
                    handleInputChange("linkedInUrl", e.target.value)
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-sm focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#8a8a8a] flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-[#FF5757]" /> GitHub
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    handleInputChange("githubUrl", e.target.value)
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-sm focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#8a8a8a] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF5757]" />{" "}
                  LeetCode
                </label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/username"
                  value={formData.leetCodeUrl}
                  onChange={(e) =>
                    handleInputChange("leetCodeUrl", e.target.value)
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-[#f0f0f0] text-sm focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">Goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DSA_GOALS.map((goal) => {
                const isSelected = formData.goal === goal.value;
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() =>
                      handleInputChange("goal", goal.value as DsaGoal)
                    }
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-[#FF5757] bg-[#FF5757] text-white shadow-[0_8px_24px_rgba(255,87,87,0.22)]"
                        : "border-[#2a2a2a] bg-[#0a0a0a] text-[#f0f0f0] hover:border-[#FF5757]/50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl leading-none">{goal.icon}</span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {goal.label}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isSelected ? "text-white/90" : "text-[#8a8a8a]",
                          )}
                        >
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
              <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">
                Timeline
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DSA_TIMELINES.map((tm) => {
                  const isSelected = formData.timeline === tm.value;
                  return (
                    <button
                      key={tm.value}
                      type="button"
                      onClick={() =>
                        handleInputChange("timeline", tm.value as DsaTimeline)
                      }
                      className={cn(
                        "rounded-lg border p-2 text-center transition-all",
                        isSelected
                          ? "border-[#FF5757] bg-[#FF5757] text-white shadow-[0_8px_24px_rgba(255,87,87,0.22)]"
                          : "border-[#2a2a2a] bg-[#0a0a0a] text-[#f0f0f0] hover:border-[#FF5757]/50",
                      )}
                    >
                      <p className="text-lg leading-none">{tm.icon}</p>
                      <p className="text-xs font-semibold mt-1">{tm.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
              <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">
                Experience
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DSA_EXPERIENCE_LEVELS.map((exp) => {
                  const isSelected = formData.experienceLevel === exp.value;
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() =>
                        handleInputChange(
                          "experienceLevel",
                          exp.value as DsaExperience,
                        )
                      }
                      className={cn(
                        "rounded-lg border p-2 text-center transition-all",
                        isSelected
                          ? "border-[#FF5757] bg-[#FF5757] text-white shadow-[0_8px_24px_rgba(255,87,87,0.22)]"
                          : "border-[#2a2a2a] bg-[#0a0a0a] text-[#f0f0f0] hover:border-[#FF5757]/50",
                      )}
                    >
                      <p className="text-base leading-none">{exp.icon}</p>
                      <p className="text-[11px] font-semibold mt-1 leading-tight">
                        {exp.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a2a2a] bg-[#141414] text-[#c0c0c0] hover:bg-[#1a1a1a] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#FF5757] text-white hover:bg-[#ff4a4a]"
            >
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDsaOnboardingModal;
