import { useAuth } from "@tbe/auth";
import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tbe/query";
import type { GetSEOMetaResponseType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Toast from "../common/Toast";
import Navbar from "../layout/Navbar";
import SEO from "../layout/SEO";
import { PersonalizationLoader } from "../learn/PersonalizationLoader";
import CodingProfilesCard from "./CodingProfilesCard";
import EditProfileModal from "./EditProfileModal";
import InterestsCard from "./InterestsCard";
import PlatformUsageCard from "./PlatformUsageCard";
import ProfileHeroCard from "./ProfileHeroCard";
import ProfileSidebarCard from "./ProfileSidebarCard";
import SkillsCard from "./SkillsCard";

export interface UnifiedProfilePageProps {
  seoMeta?: GetSEOMetaResponseType;
  navbarVariant?:
    | "platform"
    | "prepyatra"
    | "dsayatra"
    | "quizes"
    | "resume-yatra"
    | "oncampus"
    | "techyatra";
  profileRoute?: string;
  hideNavbar?: boolean;
  theme?: "light" | "dark";
}

export const UnifiedProfilePage: React.FC<UnifiedProfilePageProps> = ({
  seoMeta,
  navbarVariant = "platform",
  profileRoute = "/profile",
  hideNavbar = false,
  theme,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();

  const isDark =
    theme !== undefined
      ? theme === "dark"
      : navbarVariant === "dsayatra" || navbarVariant === "oncampus";

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    "general" | "goals" | "track" | "skills" | "social"
  >("general");
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const handleOpenEdit = (
    tab: "general" | "goals" | "track" | "skills" | "social" = "general",
  ) => {
    setActiveModalTab(tab);
    setIsEditOpen(true);
  };

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

  const profileRecord = profileResponse?.data as UserProfile | undefined;

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await sendRequest({
        url: `${routes.api.onboard}?userId=${encodeURIComponent(user!.id)}`,
        method: "POST",
        body: {
          userId: user!.id,
          ...payload,
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

  if (loadingUser || loadingProfile) {
    return (
      <div
        className={`fixed inset-0 z-[9999] min-h-screen w-full flex items-center justify-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <PersonalizationLoader
          fullScreen
          theme={isDark ? "dark" : "light"}
          title="Loading your profile..."
          subtitle="Setting up your dashboard, skills, and progress."
        />
      </div>
    );
  }

  if (!isAuth) {
    router.push(routes.login);
    return (
      <div
        className={`fixed inset-0 z-[9999] min-h-screen w-full flex items-center justify-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <PersonalizationLoader
          fullScreen
          theme={isDark ? "dark" : "light"}
          title="Redirecting to login..."
        />
      </div>
    );
  }

  const handleSaveProfile = async (formData: any) => {
    if (!user?.id || saveMutation.isPending) return;

    try {
      await saveMutation.mutateAsync(formData);
      setToast({
        message: "Profile updated successfully!",
        type: "success",
      });
      setIsEditOpen(false);
    } catch {
      setToast({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-[#f8f9fa] text-slate-900"
      } flex flex-col justify-between selection:bg-[#ff5757]/20 selection:text-[#ff5757]`}
    >
      {seoMeta && <SEO seoMeta={seoMeta} />}

      {!hideNavbar && (
        <Navbar
          variant={navbarVariant as any}
          profileRoute={profileRoute}
          theme={isDark ? "dark" : "light"}
        />
      )}

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-12 w-full">
        {/* Mobile Hero Greeting Card (Shown first on mobile & tablet < lg) */}
        <div className="block lg:hidden w-full mb-6">
          <ProfileHeroCard
            userProfile={profileRecord}
            currentUser={user}
            onEditClick={() => handleOpenEdit("general")}
            isDark={isDark}
          />
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Left Column (Sidebar Card) */}
          <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 lg:sticky lg:top-28">
            <ProfileSidebarCard
              userProfile={profileRecord}
              currentUser={user}
              onEditClick={() => handleOpenEdit("general")}
              isDark={isDark}
            />
          </div>

          {/* Right Column (Content Cards Stack) */}
          <div className="flex-1 min-w-0 space-y-5 w-full">
            {/* Desktop Hero Greeting Card (Shown on desktop lg+) */}
            <div className="hidden lg:block">
              <ProfileHeroCard
                userProfile={profileRecord}
                currentUser={user}
                onEditClick={() => handleOpenEdit("general")}
                isDark={isDark}
              />
            </div>

            {/* Goals & Preparation Track */}
            <PlatformUsageCard
              userProfile={profileRecord}
              currentUser={user}
              onEditClick={() => handleOpenEdit("goals")}
              isDark={isDark}
            />

            {/* Coding Profiles */}
            <CodingProfilesCard
              userProfile={profileRecord}
              currentUser={user}
              onEditClick={() => handleOpenEdit("social")}
              isDark={isDark}
            />

            {/* Interests */}
            <InterestsCard
              userProfile={profileRecord}
              currentUser={user}
              onEditClick={() => handleOpenEdit("goals")}
              isDark={isDark}
            />

            {/* Skills Card (Full-Width Rectangular with transparent skill blocks) */}
            <SkillsCard
              userProfile={profileRecord}
              currentUser={user}
              onEditClick={() => handleOpenEdit("skills")}
              isDark={isDark}
            />
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userProfile={profileRecord}
        currentUser={user}
        onSave={handleSaveProfile}
        isSaving={saveMutation.isPending}
        initialTab={activeModalTab}
      />

      {/* Footer */}
      <footer
        className={`py-6 text-center text-xs ${
          isDark
            ? "text-neutral-400 border-t border-neutral-900 bg-black"
            : "text-slate-500 border-t border-slate-200/60 bg-white"
        } mt-12`}
      >
        <p>© 2026 The Boring Education. All rights reserved.</p>
      </footer>

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

export default UnifiedProfilePage;
