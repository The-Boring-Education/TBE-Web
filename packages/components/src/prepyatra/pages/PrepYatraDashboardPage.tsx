import { useAuth } from "@tbe/auth";
import { POINTS_RULES, useGamificationContext } from "@tbe/gamification";
import { usePrepLogs } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import { recruitersService, userService } from "@tbe/services";
import type { RecruiterContact } from "@tbe/types";
import { useRouter } from "next/router";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import LoadingSpinner from "../../common/LoadingSpinner";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import DashboardTabs from "../dashboard/DashboardTabs";
import ProfileSection from "../dashboard/ProfileSection";
import BuildYourStack from "../features/BuildYourStack";
import DailyPrepEncouragement from "../features/DailyPrepEncouragement";
import AddPrepLogModal from "../modals/AddPrepLogModal";
import AddRecruiterModal from "../modals/AddRecruiterModal";
import AddSkillsModal from "../modals/AddSkillsModal";
import EditOnboardingModal from "../modals/EditOnboardingModal";

// Mobile menu icons
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    style={{ display: "block" }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </g>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    style={{ display: "block" }}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M18 6L6 18M6 6l12 12"
    />
  </svg>
);

// Navbar height constant (px) — adjust if Navbar variant changes
const NAVBAR_HEIGHT = 64;

export const PrepYatraDashboardPage = () => {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (!user?.id) return;
    if (hasInitialized.current && initializedUserId.current === user.id) return;

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

  const handleLogDeleted = () => {
    refetchPrepLogs();
    toast.success("Prep log deleted successfully!");
  };

  const handleContactDeleted = (deletedContactId: string) => {
    setRecruiterContacts((prev) =>
      prev.filter((c) => c._id !== deletedContactId),
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
    return <LoadingSpinner fullPage label="Loading your dashboard..." />;
  }

  if (!user) {
    return <LoadingSpinner fullPage label="Validating user..." />;
  }

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Top Navbar */}
      <Suspense fallback={<LoadingSpinner />}>
        <Navbar variant="prepyatra" profileRoute="/profile" />
      </Suspense>

      {/* Below-navbar layout: Sidebar + Main */}
      <div className="flex flex-1" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile FAB toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed z-50 lg:hidden flex items-center justify-center"
          style={{
            bottom: "24px",
            right: "24px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#e8372c",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(232,55,44,0.4)",
          }}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <XIcon /> : <MenuIcon />}
        </button>

        {/* LEFT SIDEBAR — fixed position with translate for mobile */}
        <aside
          className={`
            fixed top-0 left-0 z-40 flex flex-col overflow-y-auto
            transition-transform duration-300 ease-in-out
            lg:sticky lg:top-[64px] lg:translate-x-0 lg:flex-shrink-0 lg:overflow-y-visible
            w-[85vw] sm:w-[320px] lg:w-[384px]
            h-screen lg:h-[calc(100vh-64px)]
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{
            paddingTop: isSidebarOpen ? `${NAVBAR_HEIGHT}px` : "0px",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e8e8e8",
          }}
        >
          <ProfileSection
            user={user}
            profile={profile}
            onEditClick={() => {
              setIsEditModalOpen(true);
              setIsSidebarOpen(false);
            }}
          />
          <BuildYourStack
            userId={user.id || ""}
            userSkills={profile?.userSkills || []}
            lastUpdated={profile?.userSkillsLastUpdated}
            onSkillsUpdated={handleSkillsUpdated}
          />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex flex-col flex-1 min-w-0 p-4 sm:p-6 lg:p-10 gap-6">
          {/* Daily check-in card */}
          <DailyPrepEncouragement
            userId={user?.id || ""}
            onAddPrepLog={() => setIsPrepLogModalOpen(true)}
          />

          {/* Tab navigation + tab content */}
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
        </main>
      </div>

      {/* Footer */}
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>

      {/* ── Modals ── */}
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
          onContactUpdated={handleContactUpdated}
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
