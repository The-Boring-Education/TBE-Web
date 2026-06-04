import { ProtectedRoute, useAuth } from "@tbe/auth";
import { LoadingSpinner, Section, SEO, Toast } from "@tbe/components";
import {
  DSA_EXPERIENCE_LEVELS,
  DSA_GOALS,
  DSA_TIMELINES,
  PAGE_REFRESH_TIMEOUT,
  routes,
} from "@tbe/constants";
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
import {
  getPreFetchProps,
  normalizeOptionalProfileUrl,
  sendRequest,
} from "@tbe/utils";
import { ExternalLink, Github, Linkedin, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

/** Fields returned by GET /user that we show on this page. */
interface DsaProfilePageApiUser extends Omit<UserProfile, "name"> {
  name?: string;
  email?: string;
  image?: string;
}

const DsaProfilePage = ({ seoMeta }: { seoMeta: GetSEOMetaResponseType }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();

  const [form, setForm] = useState({
    name: "",
    userName: "",
    linkedInUrl: "",
    githubUrl: "",
    leetCodeUrl: "",
    goal: "Product-based",
    timeline: "6Months",
    experienceLevel: "Fresher (0-1 yr)",
    preferredLanguage: "C++",
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
    | DsaProfilePageApiUser
    | undefined;
  // The backend may return `username` (lowercase n) instead of `userName` depending
  // on which endpoint wrote the data. Cast to any so we can read both safely.
  const rawRecord = profileRecord as any;
  const resolvedUserName =
    profileRecord?.userName ?? rawRecord?.username ?? user?.userName ?? "";

  const savedUserName = resolvedUserName;

  const displayName = profileRecord?.name ?? user?.name ?? "User";
  const displayEmail = profileRecord?.email ?? user?.email ?? "";
  const displayImage = profileRecord?.image ?? user?.image;

  const resetFormFromSources = () => {
    if (!user?.id) return;
    setForm({
      name: profileRecord?.name ?? user?.name ?? "",
      userName: resolvedUserName,
      linkedInUrl: profileRecord?.linkedInUrl ?? "",
      githubUrl: profileRecord?.githubUrl ?? "",
      leetCodeUrl: profileRecord?.leetCodeUrl ?? "",
      goal: profileRecord?.dsaYatra?.target ?? "Product-based",
      timeline: profileRecord?.dsaYatra?.timeline ?? "6Months",
      experienceLevel:
        profileRecord?.dsaYatra?.experienceLevel ?? "Fresher (0-1 yr)",
      preferredLanguage: profileRecord?.dsaYatra?.preferredLanguage ?? "C++",
    });
  };

  useEffect(() => {
    if (!user?.id || isEditing) return;
    setForm({
      name: profileRecord?.name ?? user?.name ?? "",
      userName: resolvedUserName,
      linkedInUrl: profileRecord?.linkedInUrl ?? "",
      githubUrl: profileRecord?.githubUrl ?? "",
      leetCodeUrl: profileRecord?.leetCodeUrl ?? "",
      goal: profileRecord?.dsaYatra?.target ?? "Product-based",
      timeline: profileRecord?.dsaYatra?.timeline ?? "6Months",
      experienceLevel:
        profileRecord?.dsaYatra?.experienceLevel ?? "Fresher (0-1 yr)",
      preferredLanguage: profileRecord?.dsaYatra?.preferredLanguage ?? "C++",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileRecord, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await sendRequest({
        url: "/dsayatra/onboarding",
        method: "POST",
        body: {
          userId: user!.id,
          name: payload.name.trim(),
          username: payload.userName.trim(),
          target: payload.goal,
          timeline: payload.timeline,
          experienceLevel: payload.experienceLevel,
          preferredLanguage: payload.preferredLanguage,
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

  const updateForm = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

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
    if (isEditing && form.userName !== savedUserName && !isUsernameAvailable)
      return false;
    return true;
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className="pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 bg-black min-h-screen flex items-start justify-center text-[#e0e0e0] selection:bg-[#ff5757]/30 selection:text-white">
        <div className="w-full max-w-xl flex flex-col gap-6">
          {/* Top Header Bar (Outside Card) */}
          <div className="flex items-start justify-between px-5 sm:px-0">
            <div className="space-y-1 pr-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                Your <span className="text-[#FF5757]">Profile</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                View and update your preference
              </p>
            </div>

            {/* Actions Button */}
            <div className="shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-[#333] hover:border-[#ff5757]/40 bg-[#1c1c1c] hover:bg-[#222] text-[#f0f0f0] rounded-xl text-xs sm:text-sm font-bold transition hover:scale-[1.02] active:scale-[0.98]"
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
                    className="px-3 py-2 border border-[#333] hover:bg-[#1a1a1a] text-[#a0a0a0] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!isFormValid() || saveMutation.isPending}
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#FF5757] hover:bg-[#ff4444] text-white rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-[#FF5757]/20"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Card Container */}
          <div className="w-full bg-transparent sm:bg-[#111] border-0 sm:border border-[#222] rounded-none sm:rounded-2xl p-0 sm:p-10 shadow-none sm:shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 size-[320px] rounded-full bg-[#ff5757]/[0.03] blur-[80px] pointer-events-none translate-x-1/4 -translate-y-1/4" />

            {/* Header section (Avatar + Info) */}
            <div className="relative z-10 flex items-center gap-5 sm:gap-8 mb-4 px-5 sm:px-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#252525] overflow-hidden bg-[#1a1a1a] shrink-0">
                {displayImage ? (
                  <img
                    alt={displayName}
                    className="w-full h-full object-cover"
                    src={displayImage}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff5757] to-[#cc4444] text-slate-100 text-3xl font-black">
                    {displayName[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl font-black text-slate-100 break-words leading-tight">
                  {displayName}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-normal mt-0.5 break-words">
                  @{form.userName || "username"}
                </p>
              </div>
            </div>

            {/* Details Section */}
            {isEditing ? (
              <div className="relative z-10 space-y-6 pt-4 border-t border-[#222] text-base px-5 sm:px-0">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-400">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-md px-3 py-2 rounded-lg border border-[#2a2a2a] focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-sm font-medium text-slate-200 bg-[#0a0a0a] transition-all"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Full Name"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-400">
                    Username <span className="text-primary">*</span>
                  </label>
                  <div className="relative flex items-center max-w-md">
                    <span className="absolute left-3 text-slate-500 font-light text-sm select-none">
                      @
                    </span>
                    <input
                      type="text"
                      className="w-full pl-7 pr-4 py-2 rounded-lg border border-[#2a2a2a] focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-sm font-medium text-slate-200 bg-[#0a0a0a] transition-all"
                      value={form.userName}
                      onChange={(e) => updateForm("userName", e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  {form.userName && form.userName !== savedUserName && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded self-start mt-0.5 ${
                        isUsernameAvailable
                          ? "bg-green-950/30 text-[#31ad6b]"
                          : "bg-red-950/30 text-[#FF5757]"
                      }`}
                    >
                      {usernameMessage}
                    </span>
                  )}
                </div>

                {/* Email Address (Read-only locked format) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-500">
                    Email Address{" "}
                    <span className="text-xs font-normal text-slate-500 font-mono">
                      (locked)
                    </span>
                  </label>
                  <div className="relative flex items-center max-w-md opacity-50">
                    <Mail className="absolute left-3 text-slate-500 w-3.5 h-3.5" />
                    <input
                      type="email"
                      className="w-full pl-7 pr-4 py-2 rounded-lg border border-[#2a2a2a] text-sm font-medium text-slate-400 bg-[#0a0a0a] cursor-not-allowed outline-none"
                      value={displayEmail}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                {/* Social Profiles */}
                <div className="rounded-lg border border-[#222] bg-[#151515]/90 p-4 space-y-4">
                  <h3 className="text-sm font-bold text-[#fafafa]">
                    Social Profiles
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Linkedin className="size-3.5 text-[#FF5757]" />{" "}
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#2a2a2a] focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs font-medium text-slate-200 bg-[#0a0a0a] transition-all"
                        value={form.linkedInUrl}
                        onChange={(e) =>
                          updateForm("linkedInUrl", e.target.value)
                        }
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Github className="size-3.5 text-[#FF5757]" /> GitHub
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#2a2a2a] focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs font-medium text-slate-200 bg-[#0a0a0a] transition-all"
                        value={form.githubUrl}
                        onChange={(e) =>
                          updateForm("githubUrl", e.target.value)
                        }
                        placeholder="GitHub Profile URL"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <ExternalLink className="size-3.5 text-[#FF5757]" />{" "}
                        LeetCode
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#2a2a2a] focus:border-[#FF5757] focus:ring-2 focus:ring-[#FF5757]/20 outline-none text-xs font-medium text-slate-200 bg-[#0a0a0a] transition-all"
                        value={form.leetCodeUrl}
                        onChange={(e) =>
                          updateForm("leetCodeUrl", e.target.value)
                        }
                        placeholder="LeetCode Profile URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Focus */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400">
                    Current Focus / Target
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DSA_GOALS.map((goal) => {
                      const isSelected = form.goal === goal.value;
                      return (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => updateForm("goal", goal.value)}
                          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-[#FF5757]/10 text-[#FF5757]"
                              : "border-[#2a2a2a] hover:border-[#FF5757]/50 text-slate-400 bg-transparent"
                          }`}
                        >
                          {goal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400">
                    Goal Timeline
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DSA_TIMELINES.map((tm) => {
                      const isSelected = form.timeline === tm.value;
                      return (
                        <button
                          key={tm.value}
                          type="button"
                          onClick={() => updateForm("timeline", tm.value)}
                          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-[#FF5757]/10 text-[#FF5757]"
                              : "border-[#2a2a2a] hover:border-[#FF5757]/50 text-slate-400 bg-transparent"
                          }`}
                        >
                          {tm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400">
                    Experience Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DSA_EXPERIENCE_LEVELS.map((exp) => {
                      const isSelected = form.experienceLevel === exp.value;
                      return (
                        <button
                          key={exp.value}
                          type="button"
                          onClick={() =>
                            updateForm("experienceLevel", exp.value)
                          }
                          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-[#FF5757]/10 text-[#FF5757]"
                              : "border-[#2a2a2a] hover:border-[#FF5757]/50 text-slate-400 bg-transparent"
                          }`}
                        >
                          {exp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Language */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400">
                    Preferred Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["C++", "Java", "Python", "JavaScript"].map((lang) => {
                      const isSelected = form.preferredLanguage === lang;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => updateForm("preferredLanguage", lang)}
                          className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                            isSelected
                              ? "border-[#FF5757] bg-[#FF5757]/10 text-[#FF5757]"
                              : "border-[#2a2a2a] hover:border-[#FF5757]/50 text-slate-400 bg-transparent"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-4 pt-4 border-t border-[#222] text-base text-slate-300 px-5 sm:px-0">
                <div className="flex items-center">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Username
                  </span>
                  <span className="text-slate-200 font-medium">
                    @{form.userName || "not_set"}
                  </span>
                </div>
                <div className="flex items-center min-w-0">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Email
                  </span>
                  <span
                    className="text-slate-200 break-all min-w-0 flex-1"
                    title={displayEmail}
                  >
                    {displayEmail || "not_set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Language
                  </span>
                  <span className="text-slate-200 font-medium">
                    {form.preferredLanguage}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Experience
                  </span>
                  <span className="text-slate-200">{form.experienceLevel}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Timeline
                  </span>
                  <span className="text-slate-200">
                    {DSA_TIMELINES.find((t) => t.value === form.timeline)
                      ?.label || form.timeline}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-400 w-32 shrink-0">
                    Target Focus
                  </span>
                  <span className="text-slate-200">
                    {DSA_GOALS.find((g) => g.value === form.goal)?.label ||
                      form.goal}
                  </span>
                </div>

                {/* Social Profiles */}
                <div className="pt-4 border-t border-[#222] space-y-3">
                  <h3 className="text-sm font-bold text-slate-400">
                    Social Profiles
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {form.linkedInUrl && (
                      <a
                        href={
                          form.linkedInUrl.startsWith("http")
                            ? form.linkedInUrl
                            : `https://${form.linkedInUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:bg-[#1c1c1c] hover:border-[#FF5757]/45 hover:text-[#f0f0f0] text-slate-300 text-xs font-bold transition"
                      >
                        <Linkedin className="size-3 text-[#FF5757]" />
                        LinkedIn
                      </a>
                    )}
                    {form.githubUrl && (
                      <a
                        href={
                          form.githubUrl.startsWith("http")
                            ? form.githubUrl
                            : `https://${form.githubUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:bg-[#1c1c1c] hover:border-[#FF5757]/45 hover:text-[#f0f0f0] text-slate-300 text-xs font-bold transition"
                      >
                        <Github className="size-3 text-[#FF5757]" />
                        GitHub
                      </a>
                    )}
                    {form.leetCodeUrl && (
                      <a
                        href={
                          form.leetCodeUrl.startsWith("http")
                            ? form.leetCodeUrl
                            : `https://${form.leetCodeUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:bg-[#1c1c1c] hover:border-[#FF5757]/45 hover:text-[#f0f0f0] text-slate-300 text-xs font-bold transition"
                      >
                        <ExternalLink className="size-3 text-[#FF5757]" />
                        LeetCode
                      </a>
                    )}
                    {!form.linkedInUrl &&
                      !form.githubUrl &&
                      !form.leetCodeUrl && (
                        <span className="text-slate-500 text-sm">
                          No social profiles linked
                        </span>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Log Out footer */}
            <div className="relative z-10 pt-6 mt-8 border-t border-[#222] flex justify-between items-center text-xs text-slate-500 px-5 sm:px-0">
              <span>Account status: Active</span>
              <button
                onClick={() => signOut(routes.home)}
                className="text-slate-500 hover:text-[#FF5757] font-semibold hover:underline flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
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

const ProfilePage = ({ seoMeta, slug }: PageProps) => {
  return (
    <ProtectedRoute redirectTo="/login">
      <Fragment>
        <SEO seoMeta={seoMeta} />
        <DsaProfilePage seoMeta={seoMeta} />
      </Fragment>
    </ProtectedRoute>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.dsayatra.home,
    appId: "dsayatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default ProfilePage;
