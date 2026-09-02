import { COUNTRY_CODES, USER_ROLE_OPTIONS } from "@tbe/constants";
import { useUsername } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import {
  normalizeContactNoForForm,
  normalizeOptionalProfileUrl,
} from "@tbe/utils";
import React, { useEffect, useState } from "react";
import {
  LuCheck,
  LuClock,
  LuCode2,
  LuPlus,
  LuTarget,
  LuUser,
} from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  currentUser?: any;
  onSave: (_data: any) => Promise<void>;
  isSaving?: boolean;
  initialTab?: "general" | "goals" | "track" | "skills" | "social";
}

const ALL_AVAILABLE_SKILLS = [
  "C / C++",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "MongoDB",
  "SQL",
  "Git & GitHub",
  "System Design",
  "Linux",
  "Docker",
  "Java",
  "AWS",
  "Tailwind CSS",
  "GraphQL",
  "Kubernetes",
  "PostgreSQL",
  "Redis",
];

const PURPOSE_OPTIONS = [
  { value: "web_dev", label: "🌐 Web Development (Full-Stack)" },
  { value: "dsa", label: "🧩 Data Structures & Algorithms" },
  { value: "ai_ml", label: "🤖 AI & Machine Learning" },
  { value: "core_cs", label: "🏛️ System Design & Core CS" },
  { value: "mobile_dev", label: "📱 Mobile App Development" },
  { value: "devops", label: "☁️ Cloud & DevOps" },
];

const GOAL_OPTIONS = [
  { value: "crack_placements", label: "🎯 Crack Tech Placements & Job Search" },
  { value: "build_projects", label: "🛠️ Build Production-Ready Projects" },
  { value: "job_skill", label: "📈 Upskill & Level Up for Current Job" },
  { value: "fun_school", label: "📚 Learn for Fun / College Exams" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "🌱 Beginner (0–1 yr) — Learning basics" },
  {
    value: "intermediate",
    label: "⚡ Intermediate (1–3 yrs) — Building projects",
  },
  { value: "advanced", label: "🚀 Advanced (3+ yrs) — Production experience" },
];

const TIMELINE_OPTIONS = [
  { value: "3_months", label: "⏱️ 1–3 Months (Fast-Track Sprint)" },
  { value: "6_months", label: "📅 4–6 Months (Structured Roadmap)" },
  { value: "1_year", label: "🗓️ 6–12 Months (Long-Term Mastery)" },
];

const LANGUAGE_OPTIONS = [
  { value: "C++", label: "C++" },
  { value: "Java", label: "Java" },
  { value: "Python", label: "Python" },
  { value: "JavaScript", label: "JavaScript / TypeScript" },
];

const TARGET_COMPANY_OPTIONS = [
  { value: "startup", label: "🦄 High-Growth Startups" },
  { value: "faang", label: "🏢 Product Companies / FAANG" },
  { value: "mnc", label: "🌐 Top Tech MNCs & Enterprise" },
  { value: "oncampus", label: "🎓 On-Campus College Placements" },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentUser,
  onSave,
  isSaving = false,
  initialTab = "general",
}) => {
  const getInitialStep = (tab: string) => {
    if (tab === "goals") return 2;
    if (tab === "track") return 3;
    if (tab === "skills" || tab === "social") return 4;
    return 1;
  };

  const [activeStep, setActiveStep] = useState<number>(
    getInitialStep(initialTab),
  );

  const initialUserName =
    userProfile?.userName ||
    currentUser?.userName ||
    (currentUser as any)?.username ||
    "";

  const [form, setForm] = useState({
    name: "",
    userName: "",
    headline: "",
    occupation: "TECH_STUDENT",
    contactNo: "+91",
    location: "India",
    aboutMe: "",
    purpose: [] as string[],
    goal: "crack_placements",
    experienceLevel: "beginner",
    timeline: "6_months",
    preferredLanguage: "JavaScript",
    targetCompanies: [] as string[],
    userSkills: [] as string[],
    githubUrl: "",
    leetCodeUrl: "",
    linkedInUrl: "",
    codeforcesUrl: "",
  });

  const [customSkillInput, setCustomSkillInput] = useState("");
  const prevIsOpenRef = React.useRef(false);

  const resetForm = () => {
    // 1. Resolve Goal
    const rawGoal =
      userProfile?.prepYatra?.goal ||
      (userProfile as any)?.goal ||
      currentUser?.goal ||
      "crack_placements";

    // 2. Resolve Timeline
    const rawTimeline =
      userProfile?.dsaYatra?.timeline ||
      userProfile?.oncampus?.duration ||
      (userProfile as any)?.timeline ||
      "";
    let normalizedTimeline = "6_months";
    if (
      rawTimeline === "3Months" ||
      rawTimeline === "1Month" ||
      rawTimeline === "3_months"
    ) {
      normalizedTimeline = "3_months";
    } else if (rawTimeline === "1Year" || rawTimeline === "1_year") {
      normalizedTimeline = "1_year";
    } else if (rawTimeline === "6Months" || rawTimeline === "6_months") {
      normalizedTimeline = "6_months";
    }

    // 3. Resolve Experience Level
    const rawExp =
      userProfile?.prepYatra?.experienceLevel ||
      userProfile?.dsaYatra?.experienceLevel ||
      userProfile?.oncampus?.experienceLevel ||
      (userProfile as any)?.experienceLevel ||
      "beginner";
    let normalizedExp = "beginner";
    const lowerExp = String(rawExp).toLowerCase();
    if (
      lowerExp.includes("advanced") ||
      lowerExp.includes("3+") ||
      lowerExp.includes("experienced")
    ) {
      normalizedExp = "advanced";
    } else if (
      lowerExp.includes("intermediate") ||
      lowerExp.includes("1-3") ||
      lowerExp.includes("1 to 3")
    ) {
      normalizedExp = "intermediate";
    } else {
      normalizedExp = "beginner";
    }

    // 4. Resolve Preferred Language
    const rawLang =
      userProfile?.dsaYatra?.preferredLanguage ||
      (userProfile as any)?.preferredLanguage ||
      "JavaScript";

    // 5. Resolve Target Companies
    const rawCompanies =
      userProfile?.prepYatra?.targetCompanies ||
      (userProfile as any)?.targetCompanies ||
      [];
    const normalizedCompanies = Array.isArray(rawCompanies)
      ? rawCompanies.map((c: string) => String(c).toLowerCase())
      : [];

    // 6. Resolve Purpose / Topics
    const rawPurpose =
      userProfile?.purpose ||
      userProfile?.prepYatra?.preferences?.focusAreas ||
      userProfile?.dsaYatra?.targetTopics ||
      currentUser?.purpose ||
      [];
    const normalizedPurpose = Array.isArray(rawPurpose) ? [...rawPurpose] : [];

    // 7. Resolve Skills
    const rawSkills = userProfile?.userSkills || currentUser?.userSkills || [];

    setForm({
      name: userProfile?.name || currentUser?.name || "",
      userName: initialUserName,
      headline: userProfile?.headline || "",
      occupation:
        userProfile?.occupation || currentUser?.occupation || "TECH_STUDENT",
      contactNo: normalizeContactNoForForm(
        userProfile?.contactNo || currentUser?.contactNo,
      ),
      location:
        userProfile?.location ||
        (userProfile?.contactNo?.startsWith("+1") ? "United States" : "India"),
      aboutMe: userProfile?.aboutMe || "",
      purpose: normalizedPurpose,
      goal: rawGoal,
      experienceLevel: normalizedExp,
      timeline: normalizedTimeline,
      preferredLanguage: rawLang,
      targetCompanies: normalizedCompanies,
      userSkills: Array.isArray(rawSkills) ? [...rawSkills] : [],
      githubUrl: userProfile?.githubUrl || currentUser?.githubUrl || "",
      leetCodeUrl: userProfile?.leetCodeUrl || currentUser?.leetCodeUrl || "",
      linkedInUrl: userProfile?.linkedInUrl || currentUser?.linkedInUrl || "",
      codeforcesUrl:
        (userProfile as any)?.codeforcesUrl || currentUser?.codeforcesUrl || "",
    });
  };

  useEffect(() => {
    // Only initialize/reset form when modal transitions from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      resetForm();
      setActiveStep(getInitialStep(initialTab));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialTab, userProfile, currentUser]);

  const {
    message: usernameMessage,
    isUsernameAvailable,
    isChecking,
  } = useUsername(form.userName !== initialUserName ? form.userName : "");

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiselectToggle = (
    field: "purpose" | "targetCompanies" | "userSkills",
    value: string,
  ) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!form.userSkills.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        userSkills: [...prev.userSkills, trimmed],
      }));
    }
    setCustomSkillInput("");
  };

  const isFormValid = () => {
    if (!form.name.trim()) return false;
    if (!form.userName.trim() || form.userName.trim().length < 3) return false;
    if (form.userName !== initialUserName && !isUsernameAvailable) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSaving) return;

    await onSave({
      name: form.name.trim(),
      userName: form.userName.trim(),
      headline: form.headline.trim(),
      occupation: form.occupation,
      contactNo: form.contactNo.trim(),
      location: form.location.trim(),
      aboutMe: form.aboutMe.trim(),
      purpose: form.purpose,
      goal: form.goal,
      experienceLevel: form.experienceLevel,
      timeline: form.timeline,
      preferredLanguage: form.preferredLanguage,
      targetCompanies: form.targetCompanies,
      userSkills: form.userSkills,
      githubUrl: normalizeOptionalProfileUrl(form.githubUrl),
      leetCodeUrl: normalizeOptionalProfileUrl(form.leetCodeUrl),
      linkedInUrl: normalizeOptionalProfileUrl(form.linkedInUrl),
      codeforcesUrl: normalizeOptionalProfileUrl(form.codeforcesUrl),
    });
  };

  const [countryCode, phoneNumber] = (() => {
    const raw = form.contactNo.trim();
    const parts = raw.split(/\s+/);
    if (parts.length > 1) {
      return [parts[0] || "+91", parts.slice(1).join(" ")];
    }
    const match = raw.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      return [match[1] || "+91", (match[2] || "").trim()];
    }
    return ["+91", raw];
  })();

  const steps = [
    { number: 1, title: "Identity", icon: <LuUser className="w-3.5 h-3.5" /> },
    { number: 2, title: "Goals", icon: <LuTarget className="w-3.5 h-3.5" /> },
    { number: 3, title: "Timeline", icon: <LuClock className="w-3.5 h-3.5" /> },
    {
      number: 4,
      title: "Skills & Links",
      icon: <LuCode2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xl flex flex-col max-h-[90vh]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Edit Profile & Preferences
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your identity, learning track, preparation goals and
                  tech skills.
                </p>
              </div>
            </div>

            {/* 4-Step Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1.5 pt-4">
              {steps.map((s) => {
                const isActive = activeStep === s.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setActiveStep(s.number)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#FF5757]/10 text-[#FF5757] border border-[#FF5757]/30 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <span className="shrink-0">{s.icon}</span>
                    <span className="truncate hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{s.number}</span>
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          {/* Scrollable Step Form Body */}
          <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-6">
            {/* STEP 1: IDENTITY & BASIC PROFILE */}
            {activeStep === 1 && (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Full Name <span className="text-[#FF5757]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Username <span className="text-[#FF5757]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.userName}
                    onChange={(e) => updateField("userName", e.target.value)}
                    placeholder="Choose unique username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition"
                  />
                  {isChecking && (
                    <span className="text-[11px] text-slate-400">
                      Checking availability...
                    </span>
                  )}
                  {!isChecking && usernameMessage && (
                    <span
                      className={`text-[11px] font-semibold ${
                        isUsernameAvailable
                          ? "text-emerald-600"
                          : "text-[#FF5757]"
                      }`}
                    >
                      {usernameMessage}
                    </span>
                  )}
                </div>

                {/* Current Occupation / Role Cards (Onboarding Style) */}
                <div className="flex flex-col gap-2 pt-1">
                  <label className="text-xs font-bold text-slate-800">
                    Current Occupation / Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {USER_ROLE_OPTIONS.map((role) => {
                      const isSelected = form.occupation === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateField("occupation", role.value)}
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{role.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile / Contact Number */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-800">
                    Mobile / WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) =>
                        updateField(
                          "contactNo",
                          `${e.target.value} ${phoneNumber}`,
                        )
                      }
                      className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white outline-none cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) =>
                        updateField(
                          "contactNo",
                          `${countryCode} ${e.target.value}`,
                        )
                      }
                      placeholder="98765 43210"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                </div>

                {/* Headline & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={form.headline}
                      onChange={(e) => updateField("headline", e.target.value)}
                      placeholder="e.g. Aspiring Full Stack Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition"
                    />
                  </div>
                </div>

                {/* About Me / Bio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    About Me / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={form.aboutMe}
                    onChange={(e) => updateField("aboutMe", e.target.value)}
                    placeholder="Tell others about your coding journey, tech interests and aspirations..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs sm:text-sm text-slate-900 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: LEARNING FOCUS & CAREER GOALS */}
            {activeStep === 2 && (
              <div className="space-y-5">
                {/* Topics to master (multiselect) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    What topics do you want to master?{" "}
                    <span className="text-slate-400 font-normal">
                      (Select multiple)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PURPOSE_OPTIONS.map((item) => {
                      const isSelected = form.purpose.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            handleMultiselectToggle("purpose", item.value)
                          }
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Career Goal */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Primary Career Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {GOAL_OPTIONS.map((g) => {
                      const isSelected = form.goal === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => updateField("goal", g.value)}
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{g.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE, TIMELINE & LANGUAGE */}
            {activeStep === 3 && (
              <div className="space-y-5">
                {/* Coding Experience Level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Coding Experience Level
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {EXPERIENCE_OPTIONS.map((exp) => {
                      const isSelected = form.experienceLevel === exp.value;
                      return (
                        <button
                          key={exp.value}
                          type="button"
                          onClick={() =>
                            updateField("experienceLevel", exp.value)
                          }
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{exp.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Preparation Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Target Preparation Timeline
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {TIMELINE_OPTIONS.map((t) => {
                      const isSelected = form.timeline === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => updateField("timeline", t.value)}
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{t.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Programming Language */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Preferred Programming Language
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = form.preferredLanguage === lang.value;
                      return (
                        <button
                          key={lang.value}
                          type="button"
                          onClick={() =>
                            updateField("preferredLanguage", lang.value)
                          }
                          className={`px-3.5 py-3 border text-center text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{lang.label}</span>
                          {isSelected && (
                            <LuCheck className="w-3.5 h-3.5 text-[#FF4D4D]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: TARGET COMPANIES, SKILLS & PROFILES */}
            {activeStep === 4 && (
              <div className="space-y-5">
                {/* Target Companies */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Target Company Types{" "}
                    <span className="text-slate-400 font-normal">
                      (Select multiple)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TARGET_COMPANY_OPTIONS.map((c) => {
                      const isSelected = form.targetCompanies.includes(c.value);
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() =>
                            handleMultiselectToggle("targetCompanies", c.value)
                          }
                          className={`px-3.5 py-3 border text-left text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                            isSelected
                              ? "bg-[#FFF0F0] border-[#FF4D4D] text-[#10162F] font-bold ring-1 ring-[#FF4D4D]/30"
                              : "bg-white border-slate-200 hover:border-slate-800 text-slate-800"
                          }`}
                        >
                          <span>{c.label}</span>
                          {isSelected && (
                            <LuCheck className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Technical Skills & Frameworks
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {ALL_AVAILABLE_SKILLS.map((skill) => {
                      const isSelected = form.userSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            handleMultiselectToggle("userSkills", skill)
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? "bg-[#FF5757] text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{skill}</span>
                          {isSelected && <LuCheck className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Skill */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddCustomSkill())
                      }
                      placeholder="Add custom skill (e.g. Next.js, Prisma)"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#FF5757] outline-none text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Social & Coding Profiles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block">
                    Coding & Social Profiles{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        GitHub URL
                      </span>
                      <input
                        type="url"
                        value={form.githubUrl}
                        onChange={(e) =>
                          updateField("githubUrl", e.target.value)
                        }
                        placeholder="https://github.com/username"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF5757] outline-none text-xs text-slate-900 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        LeetCode URL
                      </span>
                      <input
                        type="url"
                        value={form.leetCodeUrl}
                        onChange={(e) =>
                          updateField("leetCodeUrl", e.target.value)
                        }
                        placeholder="https://leetcode.com/u/username"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF5757] outline-none text-xs text-slate-900 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        LinkedIn URL
                      </span>
                      <input
                        type="url"
                        value={form.linkedInUrl}
                        onChange={(e) =>
                          updateField("linkedInUrl", e.target.value)
                        }
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF5757] outline-none text-xs text-slate-900 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Codeforces URL
                      </span>
                      <input
                        type="url"
                        value={form.codeforcesUrl}
                        onChange={(e) =>
                          updateField("codeforcesUrl", e.target.value)
                        }
                        placeholder="https://codeforces.com/profile/username"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF5757] outline-none text-xs text-slate-900 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Step Controls & Save Button */}
          <DialogFooter className="px-5 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex flex-row items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (activeStep > 1) {
                  setActiveStep((s) => s - 1);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {activeStep > 1 ? "← Previous" : "Cancel"}
            </button>

            <div className="flex items-center gap-2">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => s + 1)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Next Step →
                </button>
              ) : null}

              <button
                type="submit"
                disabled={!isFormValid() || isSaving}
                className="px-5 py-2 rounded-xl bg-[#FF5757] hover:bg-[#e04343] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
