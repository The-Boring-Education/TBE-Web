import { useAuth } from "@tbe/auth";
import { LoadingSpinner, Section, SEO, Toast } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useUser, useUsername } from "@tbe/hooks";
import type { PageProps, UserProfile } from "@tbe/interface";
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tbe/query";
import type { GetSEOMetaResponseType } from "@tbe/types";
import { normalizeOptionalProfileUrl, sendRequest } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { FiLogOut, FiMail } from "react-icons/fi";

type PrepYatraGoal = "3Months" | "6Months" | "1Year";
type PrepYatraExperienceLevel = "fresher" | "junior" | "mid" | "senior";
type PrepYatraCompanyType = "Startup" | "MidSize" | "MNC" | "FAANG";
type PrepYatraInterviewCategory =
  | "MNC"
  | "MERN"
  | "CollegePlacement"
  | "DSA"
  | "SystemDesign"
  | "GeneralTech";

const PREP_YATRA_GOALS: Array<{
  value: PrepYatraGoal;
  label: string;
}> = [
  { value: "3Months", label: "3 Months" },
  { value: "6Months", label: "6 Months" },
  { value: "1Year", label: "1 Year" },
];

const PREP_YATRA_EXPERIENCE_LEVELS: Array<{
  value: PrepYatraExperienceLevel;
  label: string;
}> = [
  { value: "fresher", label: "Fresher (0-1 yrs)" },
  { value: "junior", label: "Junior (1-3 yrs)" },
  { value: "mid", label: "Mid (3-5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
];

const COMPANY_OPTIONS: Array<{
  value: PrepYatraCompanyType;
  label: string;
}> = [
  { value: "Startup", label: "Startups" },
  { value: "MidSize", label: "Mid-size" },
  { value: "MNC", label: "MNCs" },
  { value: "FAANG", label: "FAANG" },
];

const CATEGORY_OPTIONS: Array<{
  value: PrepYatraInterviewCategory;
  label: string;
}> = [
  { value: "MNC", label: "MNC Interview Prep" },
  { value: "MERN", label: "MERN Stack Prep" },
  { value: "CollegePlacement", label: "College Placement" },
  { value: "DSA", label: "DSA Focus" },
  { value: "SystemDesign", label: "System Design" },
  { value: "GeneralTech", label: "General Tech" },
];

interface PrepYatraProfilePageApiUser extends Omit<UserProfile, "name"> {
  name?: string;
  email?: string;
  image?: string;
}

interface ProfileFormData {
  name: string;
  userName: string;
  linkedInUrl: string;
  githubUrl: string;
  leetCodeUrl: string;
  goal: PrepYatraGoal;
  experienceLevel: PrepYatraExperienceLevel;
  workDomain: string;
  targetCompanies: PrepYatraCompanyType[];
  preferredCategories: PrepYatraInterviewCategory[];
}

const ProfilePage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();

  const [form, setForm] = useState<ProfileFormData>({
    name: "",
    userName: "",
    linkedInUrl: "",
    githubUrl: "",
    leetCodeUrl: "",
    goal: "6Months",
    experienceLevel: "fresher",
    workDomain: "",
    targetCompanies: [],
    preferredCategories: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const { data: profileResponse, isLoading: loadingProfile } = useQuery({
    queryKey: queryKeys.user.profile(user?.id ?? "__no_user__"),
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User id required");
      }
      return sendRequest({
        url: `${routes.api.user}?userId=${encodeURIComponent(user.id)}`,
      });
    },
    ...CACHE_TIMES.STANDARD,
    enabled: Boolean(user?.id),
  });

  const profileRecord = profileResponse?.data as
    | PrepYatraProfilePageApiUser
    | undefined;
  const rawRecord = profileRecord as any;
  const savedUserName =
    profileRecord?.userName ?? rawRecord?.username ?? user?.userName ?? "";

  const displayName = profileRecord?.name ?? user?.name ?? "User";
  const displayEmail = profileRecord?.email ?? user?.email ?? "";
  const displayImage = profileRecord?.image ?? user?.image;

  const resetFormFromSources = () => {
    if (!user?.id) return;
    setForm({
      name: profileRecord?.name ?? user?.name ?? "",
      userName: savedUserName,
      linkedInUrl: profileRecord?.linkedInUrl ?? "",
      githubUrl: profileRecord?.githubUrl ?? "",
      leetCodeUrl: profileRecord?.leetCodeUrl ?? "",
      goal: (profileRecord?.prepYatra?.goal as PrepYatraGoal) ?? "6Months",
      experienceLevel:
        (profileRecord?.prepYatra
          ?.experienceLevel as PrepYatraExperienceLevel) ?? "fresher",
      workDomain: profileRecord?.prepYatra?.workDomain ?? "",
      targetCompanies:
        (profileRecord?.prepYatra?.targetCompanies as PrepYatraCompanyType[]) ??
        [],
      preferredCategories:
        (profileRecord?.prepYatra?.preferences
          ?.interviewCategories as PrepYatraInterviewCategory[]) ?? [],
    });
  };

  useEffect(() => {
    if (!user?.id || isEditing) return;
    resetFormFromSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileRecord, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfileFormData) => {
      const res = await sendRequest({
        url: "/prepyatra/onboarding",
        method: "POST",
        body: {
          userId: user!.id,
          name: payload.name.trim(),
          username: payload.userName.trim(),
          goal: payload.goal,
          targetCompanies: payload.targetCompanies,
          preferredCategories: payload.preferredCategories,
          experienceLevel: payload.experienceLevel,
          workDomain: payload.workDomain,
          linkedInUrl: normalizeOptionalProfileUrl(payload.linkedInUrl),
          githubUrl: normalizeOptionalProfileUrl(payload.githubUrl),
          leetCodeUrl: normalizeOptionalProfileUrl(payload.leetCodeUrl),
        },
      });

      if (!res.status) {
        throw new Error(
          typeof res.message === "string" ? res.message : "Update failed",
        );
      }

      return res;
    },
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.id),
        });
      }
      await updateSession();
    },
  });

  const { message: usernameMessage, isUsernameAvailable } = useUsername(
    isEditing ? form.userName : "",
  );

  if (loadingUser)
    return <LoadingSpinner fullPage label="Loading profile..." />;
  if (!isAuth) {
    router.push(routes.login);
    return null;
  }

  if (loadingProfile)
    return <LoadingSpinner fullPage label="Loading profile..." />;

  const updateForm = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTag = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const handleSave = async () => {
    if (!user?.id || saveMutation.isPending) return;

    try {
      await saveMutation.mutateAsync({ ...form });
      setToast({
        message: "Profile updated successfully!",
        type: "success",
      });
      setIsEditing(false);
    } catch {
      setToast({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  const isFormValid = (): boolean => {
    if (!form.name.trim()) return false;
    if (!form.userName.trim() || form.userName.trim().length < 3) return false;
    if (!form.workDomain.trim()) return false;
    if (!form.goal) return false;
    if (!form.experienceLevel) return false;
    if (isEditing && form.userName !== savedUserName && !isUsernameAvailable)
      return false;
    return true;
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className="pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 bg-white sm:bg-slate-50 min-h-screen flex items-start justify-center">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="flex items-start justify-between px-5 sm:px-0">
            <div className="space-y-1 pr-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Your <span className="text-[#FF5757]">Profile</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                View and update your PrepYatra onboarding preferences.
              </p>
            </div>

            <div className="shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-md text-xs sm:text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      resetFormFromSources();
                    }}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md text-xs sm:text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!isFormValid() || saveMutation.isPending}
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#FF5757] hover:bg-[#ff4444] text-white rounded-md text-xs sm:text-sm font-semibold transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-[#FF5757]/20"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-2xl p-5 sm:p-10 shadow-none sm:shadow-sm flex flex-col">
            <div className="flex items-center gap-5 sm:gap-8 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                {displayImage ? (
                  <img
                    alt={displayName}
                    className="w-full h-full object-cover"
                    src={displayImage}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-light bg-slate-100">
                    {displayName[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-slate-950 break-words leading-tight">
                  {displayName}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-normal mt-0.5 break-words">
                  @{form.userName || "username"}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6 pt-4 border-t border-slate-100 text-base">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Full Name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Username <span className="text-primary">*</span>
                  </label>
                  <div className="relative flex items-center max-w-md">
                    <span className="absolute left-3 text-slate-400 font-light text-base select-none">
                      @
                    </span>
                    <input
                      type="text"
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                      value={form.userName}
                      onChange={(e) => updateForm("userName", e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  {form.userName && form.userName !== savedUserName && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded self-start mt-0.5 ${
                        isUsernameAvailable
                          ? "bg-green-50 text-[#31ad6b]"
                          : "bg-red-50 text-[#FF5757]"
                      }`}
                    >
                      {usernameMessage}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-400">
                    Email Address{" "}
                    <span className="text-xs font-normal text-slate-400 font-mono">
                      (locked)
                    </span>
                  </label>
                  <div className="relative flex items-center max-w-md opacity-60">
                    <FiMail className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="email"
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 text-base font-medium text-slate-500 bg-slate-100 cursor-not-allowed outline-none"
                      value={displayEmail}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Current Goal <span className="text-primary">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREP_YATRA_GOALS.map((goalOption) => {
                      const isSelected = form.goal === goalOption.value;
                      return (
                        <button
                          key={goalOption.value}
                          type="button"
                          onClick={() => updateForm("goal", goalOption.value)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-red-50 text-[#FF5757]"
                              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
                          }`}
                        >
                          {goalOption.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Experience Level <span className="text-primary">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREP_YATRA_EXPERIENCE_LEVELS.map((option) => {
                      const isSelected = form.experienceLevel === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateForm("experienceLevel", option.value)
                          }
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-red-50 text-[#FF5757]"
                              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Work Domain <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                    value={form.workDomain}
                    onChange={(e) => updateForm("workDomain", e.target.value)}
                    placeholder="Frontend / Backend / Full stack / Data Science"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Target Companies
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_OPTIONS.map((option) => {
                      const isSelected = form.targetCompanies.includes(
                        option.value,
                      );
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateForm(
                              "targetCompanies",
                              toggleTag(form.targetCompanies, option.value),
                            )
                          }
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-red-50 text-[#FF5757]"
                              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Preferred Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((option) => {
                      const isSelected = form.preferredCategories.includes(
                        option.value,
                      );
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateForm(
                              "preferredCategories",
                              toggleTag(form.preferredCategories, option.value),
                            )
                          }
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-red-50 text-[#FF5757]"
                              : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                      value={form.linkedInUrl}
                      onChange={(e) =>
                        updateForm("linkedInUrl", e.target.value)
                      }
                      placeholder="LinkedIn Profile URL"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      GitHub
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                      value={form.githubUrl}
                      onChange={(e) => updateForm("githubUrl", e.target.value)}
                      placeholder="GitHub Profile URL"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    LeetCode
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-900 bg-white transition-all"
                    value={form.leetCodeUrl}
                    onChange={(e) => updateForm("leetCodeUrl", e.target.value)}
                    placeholder="LeetCode Profile URL"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-100 text-base text-slate-700">
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Username
                  </span>
                  <span className="text-slate-700 font-medium">
                    @{form.userName || "not_set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Email
                  </span>
                  <span className="text-slate-700">
                    {displayEmail || "not_set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Current Goal
                  </span>
                  <span className="text-slate-700">
                    {PREP_YATRA_GOALS.find(
                      (option) => option.value === form.goal,
                    )?.label || "Not set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Experience
                  </span>
                  <span className="text-slate-700">
                    {PREP_YATRA_EXPERIENCE_LEVELS.find(
                      (option) => option.value === form.experienceLevel,
                    )?.label || "Not set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Work Domain
                  </span>
                  <span className="text-slate-700">
                    {form.workDomain || "Not set"}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-slate-900 w-32 shrink-0 mt-1">
                    Target Companies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {form.targetCompanies.length > 0 ? (
                      form.targetCompanies.map((value) => {
                        const label = COMPANY_OPTIONS.find(
                          (option) => option.value === value,
                        )?.label;
                        return (
                          <span
                            key={value}
                            className="px-3.5 py-1.5 rounded-full bg-red-50/20 text-[#FF5757] text-sm font-semibold border border-red-100/50"
                          >
                            {label || value}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400">Not set</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-slate-900 w-32 shrink-0 mt-1">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {form.preferredCategories.length > 0 ? (
                      form.preferredCategories.map((value) => {
                        const label = CATEGORY_OPTIONS.find(
                          (option) => option.value === value,
                        )?.label;
                        return (
                          <span
                            key={value}
                            className="px-3.5 py-1.5 rounded-full bg-red-50/20 text-[#FF5757] text-sm font-semibold border border-red-100/50"
                          >
                            {label || value}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400">Not set</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">
                      LinkedIn
                    </span>
                    <span className="text-slate-700">
                      {form.linkedInUrl || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">
                      GitHub
                    </span>
                    <span className="text-slate-700">
                      {form.githubUrl || "Not set"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">
                    LeetCode
                  </span>
                  <span className="text-slate-700">
                    {form.leetCodeUrl || "Not set"}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-6 mt-8 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">
                Account status: Active
              </span>
              <button
                onClick={() => signOut(routes.home)}
                className="text-slate-400 hover:text-[#FF5757] font-semibold hover:underline flex items-center gap-1 transition-colors"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </Section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  props: {
    seoMeta: {
      title: "Profile | PrepYatra",
      siteName: "PrepYatra",
      description: "View and update your PrepYatra onboarding profile.",
      url: "/profile",
      type: "website",
      robots: "index,follow",
      image: "https://prepyatra.theboringeducation.com/images/og-image.png",
      keywords:
        "PrepYatra, profile, onboarding, interview preparation, career goals",
      author: "The Boring Education",
      publisher: "The Boring Education",
      linkedIn: "https://www.linkedin.com/company/theboringeducation",
      instagram: "https://www.instagram.com/theboringeducation",
      github: "https://github.com/The-Boring-Education",
    } as GetSEOMetaResponseType,
  },
});

export default ProfilePage;
