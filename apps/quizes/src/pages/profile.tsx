import { ProtectedRoute, useAuth } from "@tbe/auth";
import { LoadingSpinner, Section, Toast } from "@tbe/components";
import { Layout } from "@tbe/components/quizes";
import { routes } from "@tbe/constants";
import { useUser, useUsername } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tbe/query";
import { normalizeOptionalProfileUrl, sendRequest } from "@tbe/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FiExternalLink,
  FiGithub,
  FiLinkedin,
  FiLogOut,
  FiMail,
} from "react-icons/fi";

interface QuizesProfilePageApiUser extends Omit<UserProfile, "name"> {
  name?: string;
  email?: string;
  image?: string;
}

const QuizesProfilePageContent = () => {
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
    | QuizesProfilePageApiUser
    | undefined;
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileRecord, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await sendRequest({
        url: routes.api.user,
        method: "PATCH",
        body: {
          userId: user!.id,
          name: payload.name.trim(),
          username: payload.userName.trim(),
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

  const handleSignOut = () => {
    signOut(routes.home);
  };

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
    <div className="min-h-screen w-full overflow-x-hidden bg-white sm:bg-slate-50 text-slate-700">
      <Section className="pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24 bg-white sm:bg-slate-50 flex items-start justify-center">
        <div className="w-full max-w-xl flex flex-col gap-6">
          {/* Top Header Bar (Outside Card) */}
          <div className="flex items-start justify-between px-5 sm:px-0">
            <div className="space-y-1 pr-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Your <span className="text-[#FF5757]">Profile</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                View and update your preferences
              </p>
            </div>

            {/* Actions Button */}
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

          {/* Main Card Container */}
          <div className="w-full bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-2xl p-5 sm:p-10 shadow-none sm:shadow-sm flex flex-col">
            {/* Header section (Avatar + Info) */}
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

            {/* Details Section */}
            {isEditing ? (
              <div className="space-y-6 pt-4 border-t border-slate-100 text-base">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all duration-200"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Full Name"
                  />
                </div>

                {/* Username */}
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
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-base font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all duration-200"
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

                {/* Email Address (Read-only locked format) */}
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

                {/* Social Profiles */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Social Profiles
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <FiLinkedin className="size-3.5 text-[#FF5757]" />{" "}
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-xs font-medium text-slate-800 bg-white transition-all duration-200"
                        value={form.linkedInUrl}
                        onChange={(e) =>
                          updateForm("linkedInUrl", e.target.value)
                        }
                        placeholder="LinkedIn Profile URL"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <FiGithub className="size-3.5 text-[#FF5757]" /> GitHub
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-xs font-medium text-slate-800 bg-white transition-all duration-200"
                        value={form.githubUrl}
                        onChange={(e) =>
                          updateForm("githubUrl", e.target.value)
                        }
                        placeholder="GitHub Profile URL"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <FiExternalLink className="size-3.5 text-[#FF5757]" />{" "}
                        LeetCode
                      </label>
                      <input
                        type="url"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757]/30 text-xs font-medium text-slate-800 bg-white transition-all duration-200"
                        value={form.leetCodeUrl}
                        onChange={(e) =>
                          updateForm("leetCodeUrl", e.target.value)
                        }
                        placeholder="LeetCode Profile URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-100 text-base text-slate-700">
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">
                    Username
                  </span>
                  <span className="text-slate-700 font-medium">
                    @{form.userName || "username"}
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

                {/* Social Profiles */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 text-xs font-semibold transition"
                      >
                        <FiLinkedin className="size-3 text-[#FF5757]" />
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 text-xs font-semibold transition"
                      >
                        <FiGithub className="size-3 text-[#FF5757]" />
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-700 text-xs font-semibold transition"
                      >
                        <FiExternalLink className="size-3 text-[#FF5757]" />
                        LeetCode
                      </a>
                    )}
                    {!form.linkedInUrl &&
                      !form.githubUrl &&
                      !form.leetCodeUrl && (
                        <span className="text-slate-400 text-sm">
                          No social profiles linked
                        </span>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Log Out footer */}
            <div className="pt-6 mt-8 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">
                Account status: Active
              </span>
              <button
                onClick={handleSignOut}
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
    </div>
  );
};

const QuizesProfilePage = () => {
  return (
    <Layout>
      <ProtectedRoute redirectTo="/login">
        <QuizesProfilePageContent />
      </ProtectedRoute>
    </Layout>
  );
};

export default QuizesProfilePage;
