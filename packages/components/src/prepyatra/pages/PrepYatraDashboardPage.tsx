import { useAuth } from "@tbe/auth";
import { POINTS_RULES, useGamificationContext } from "@tbe/gamification";
import { usePrepLogs } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import { recruitersService, userService } from "@tbe/services";
import type { RecruiterContact } from "@tbe/types";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import DashboardTabs from "../dashboard/DashboardTabs";
import LoadingSpinner from "../../common/LoadingSpinner";
import ProfileSection from "../dashboard/ProfileSection";
import BuildYourStack from "../features/BuildYourStack";
import DailyPrepEncouragement from "../features/DailyPrepEncouragement";
import AddPrepLogModal from "../modals/AddPrepLogModal";
import { AddRecruiterModal } from "../modals/AddRecruiterModal";
import AddSkillsModal from "../modals/AddSkillsModal";
import EditOnboardingModal from "../modals/EditOnboardingModal";

/**
 * Prep Yatra authenticated dashboard — layout, data loading, and modals.
 * Rendered from `apps/prep-yatra/src/pages/dashboard.tsx`.
 */
const PrepYatraDashboardPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { triggerCelebration, showToast } = useGamificationContext();
  const { logs: prepLogs, refetch: refetchPrepLogs } = usePrepLogs(
    user?.id ?? "",
  );

  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [recruiterContacts, setRecruiterContacts] = useState<
    RecruiterContact[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const hasInitialized = useRef(false);
  const initializedUserId = useRef<string | null>(null);

  const [isPrepLogModalOpen, setIsPrepLogModalOpen] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await userService.getProfile(userId);
      setProfile(profileData ?? undefined);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchRecruiterContacts = async (userId: string) => {
    try {
      const contacts = await recruitersService.getByUserId(userId);
      setRecruiterContacts(contacts);
    } catch (error) {
      console.error("Error fetching recruiter contacts:", error);
    }
  };

  const initializeData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    if (hasInitialized.current && initializedUserId.current === user.id) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        fetchProfile(user.id),
        fetchRecruiterContacts(user.id),
      ]);
      hasInitialized.current = true;
      initializedUserId.current = user.id;
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;

    if (user?.id) {
      if (initializedUserId.current !== user.id) {
        hasInitialized.current = false;
      }
      initializeData();
    } else {
      hasInitialized.current = false;
      initializedUserId.current = null;
    }
  }, [user?.id, authLoading, initializeData]);

  const handleLogAdded = () => {
    if (user?.id) {
      refetchPrepLogs();
      triggerCelebration({ type: "points", intensity: "low" });
      showToast({
        type: "points",
        message: "Prep log added!",
        points: POINTS_RULES.PREPLOG_CREATED,
      });
    }
  };

  const handleContactAdded = () => {
    if (user?.id) {
      fetchRecruiterContacts(user.id);
      triggerCelebration({ type: "points", intensity: "medium" });
      showToast({
        type: "points",
        message: "Recruiter contact added!",
        points: POINTS_RULES.RECRUITER_ADDED,
      });
    }
  };

  const handleContactUpdated = () => {
    if (user?.id) {
      fetchRecruiterContacts(user.id);
    }
  };

  const handleLogDeleted = (_deletedLogId: string) => {
    refetchPrepLogs();
    toast.success("Prep log deleted successfully!");
  };

  const handleContactDeleted = (deletedContactId: string) => {
    setRecruiterContacts((prevContacts) =>
      prevContacts.filter((contact) => contact._id !== deletedContactId),
    );
    toast.success("Recruiter contact deleted successfully!");
  };

  const handleSkillsUpdated = (updatedSkills: string[]) => {
    if (user?.id) {
      setProfile((prev) =>
        prev ? { ...prev, userSkills: updatedSkills } : prev,
      );
      fetchProfile(user.id);
    }
  };

  const handleProfileUpdate = () => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to access your dashboard");
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<LoadingSpinner />}>
        <Navbar variant="prepyatra" />
      </Suspense>

      <main className="w-full px-2 md:px-4 pt-[72px] pb-6">
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}

        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="fixed top-[78px] left-3 z-50 lg:hidden bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110"
          aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isSidebarCollapsed ? (
            <Menu className="w-3.5 h-3.5" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex fixed top-[78px] left-3 z-50 bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110"
          aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isSidebarCollapsed ? (
            <Menu className="w-3.5 h-3.5" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex gap-6">
          <div
            className={`${isSidebarCollapsed ? "hidden" : "block"} w-full lg:w-1/3 transition-all duration-300`}
          >
            <ProfileSection
              user={user}
              profile={profile}
              onEditClick={() => setIsEditModalOpen(true)}
            />

            <Suspense fallback={<LoadingSpinner />}>
              <BuildYourStack
                userId={user.id || ""}
                userSkills={profile?.userSkills || []}
                lastUpdated={profile?.userSkillsLastUpdated}
                onSkillsUpdated={handleSkillsUpdated}
              />
            </Suspense>
          </div>

          <div
            className={`${isSidebarCollapsed ? "w-full" : "w-full lg:w-2/3"} transition-all duration-300`}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <div className="mb-4">
                <DailyPrepEncouragement
                  userId={user?.id || ""}
                  onAddPrepLog={() => setIsPrepLogModalOpen(true)}
                />
              </div>
            </Suspense>

            <DashboardTabs
              prepLogs={prepLogs}
              recruiterContacts={recruiterContacts}
              user={user}
              userProfile={profile}
              onPrepLogModalOpen={() => setIsPrepLogModalOpen(true)}
              onRecruiterModalOpen={() => setIsRecruiterModalOpen(true)}
              onSkillsModalOpen={() => setIsSkillsModalOpen(true)}
              onContactUpdated={handleContactUpdated}
              onLogDeleted={handleLogDeleted}
              onContactDeleted={handleContactDeleted}
            />
          </div>
        </div>
      </main>

      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <AddPrepLogModal
          isOpen={isPrepLogModalOpen}
          onClose={() => setIsPrepLogModalOpen(false)}
          onLogAdded={handleLogAdded}
          mongoUserId={user?.id || ""}
        />
      </Suspense>

      <Suspense fallback={null}>
        <AddRecruiterModal
          isOpen={isRecruiterModalOpen}
          onClose={() => setIsRecruiterModalOpen(false)}
          onContactAdded={handleContactAdded}
          mongoUserId={user?.id || ""}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EditOnboardingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
          currentData={profile as never}
          userId={user?.id || ""}
        />
      </Suspense>

      <Suspense fallback={null}>
        <AddSkillsModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          userId={user?.id || ""}
          userSkills={profile?.userSkills || []}
          onSkillsUpdated={handleSkillsUpdated}
        />
      </Suspense>
    </div>
  );
};

export default PrepYatraDashboardPage;
