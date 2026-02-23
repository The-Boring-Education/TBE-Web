import { useAuth } from "@tbe/auth";
import {
    AddPrepLogModal,
    AddRecruiterModal,
    AddSkillsModal,
    BuildYourStack,
    DailyPrepEncouragement,
    DashboardTabs,
    EditOnboardingModal,
    Footer,
    LoadingSpinner,
    Navbar,
    ProfileSection,
    usePrepYatraGamificationContext
} from "@tbe/components";
import { usePrepLogs } from "@tbe/hooks";
import type { UserProfile } from "@tbe/interface";
import { recruitersService, userService } from "@tbe/services";
import type { RecruiterContact } from "@tbe/types";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const { showCelebration } = usePrepYatraGamificationContext();
    const {
        logs: prepLogs,
        refetch: refetchPrepLogs,
        setLogs: setPrepLogs
    } = usePrepLogs(user?.id);

    // State management
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recruiterContacts, setRecruiterContacts] = useState<RecruiterContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Track if data has been initialized to prevent unnecessary re-fetches
    const hasInitialized = useRef(false);
    const initializedUserId = useRef<string | null>(null);

    // Modal states
    const [isPrepLogModalOpen, setIsPrepLogModalOpen] = useState(false);
    const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

    // Data fetching functions
    const fetchProfile = async (userId: string) => {
        try {
            const profileData = await userService.getProfile(userId);
            console.log("Fetched profile data:", profileData);
            if (profileData) {
                setProfile(profileData);
            } else {
                console.warn("No profile data received for userId:", userId);
            }
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

        // Prevent re-fetching if already initialized for this user
        if (hasInitialized.current && initializedUserId.current === user.id) {
            return;
        }

        setLoading(true);
        try {
            await Promise.all([
                fetchProfile(user.id),
                fetchRecruiterContacts(user.id)
            ]);
            hasInitialized.current = true;
            initializedUserId.current = user.id;
        } catch (error) {
            console.error("Error initializing data:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Effects - Only initialize once when user ID is available
    useEffect(() => {
        if (authLoading) return;

        if (user?.id) {
            // Reset initialization flag if user ID changes
            if (initializedUserId.current !== user.id) {
                hasInitialized.current = false;
            }
            initializeData();
        } else {
            // Reset when user logs out
            hasInitialized.current = false;
            initializedUserId.current = null;
        }
    }, [user?.id, authLoading, initializeData]);

    // Event handlers
    const handleLogAdded = () => {
        if (user?.id) {
            refetchPrepLogs();
            showCelebration(10);
            toast.success("Prep log added successfully!");
        }
    };

    const handleContactAdded = () => {
        if (user?.id) {
            fetchRecruiterContacts(user.id);
            showCelebration(5);
            toast.success("Recruiter contact added successfully!");
        }
    };

    const handleContactUpdated = () => {
        if (user?.id) {
            fetchRecruiterContacts(user.id);
        }
    };

    const handleLogDeleted = (deletedLogId: string) => {
        setPrepLogs((prevLogs) =>
            prevLogs.filter((log) => log._id !== deletedLogId)
        );
        toast.success("Prep log deleted successfully!");
    };

    const handleContactDeleted = (deletedContactId: string) => {
        setRecruiterContacts((prevContacts) =>
            prevContacts.filter((contact) => contact._id !== deletedContactId)
        );
        toast.success("Recruiter contact deleted successfully!");
    };

    const handleSkillsUpdated = () => {
        if (user?.id) {
            fetchProfile(user.id);
            toast.success("Skills updated successfully!");
        }
    };

    const handleProfileUpdate = () => {
        if (user?.id) {
            fetchProfile(user.id);
        }
    };

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please sign in to access your dashboard');
            router.push('/login?callbackUrl=/dashboard');
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
                {/* Mobile backdrop */}
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                {/* Sidebar Toggle Button - Mobile */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="fixed top-[78px] left-3 z-50 lg:hidden bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110"
                >
                    {isSidebarCollapsed ? (
                        <Menu className="w-3.5 h-3.5" />
                    ) : (
                        <X className="w-3.5 h-3.5" />
                    )}
                </button>

                {/* Sidebar Toggle Button - Desktop */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex fixed top-[78px] left-3 z-50 bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110"
                >
                    {isSidebarCollapsed ? (
                        <Menu className="w-3.5 h-3.5" />
                    ) : (
                        <X className="w-3.5 h-3.5" />
                    )}
                </button>

                <div className="flex gap-6">
                    {/* Profile Section - Collapsible Sidebar */}
                    <div
                        className={`${isSidebarCollapsed ? "hidden" : "block"} w-full lg:w-1/3 transition-all duration-300`}
                    >
                        <ProfileSection
                            user={user}
                            profile={profile}
                            onEditClick={() => setIsEditModalOpen(true)}
                        />

                        {/* Additional components */}
                        <Suspense fallback={<LoadingSpinner />}>
                            <BuildYourStack
                                userId={user.id || ""}
                                userSkills={profile?.userSkills || []}
                                lastUpdated={profile?.userSkillsLastUpdated}
                                onSkillsUpdated={handleSkillsUpdated}
                            />
                        </Suspense>
                    </div>

                    {/* Main Content */}
                    <div
                        className={`${isSidebarCollapsed ? "w-full" : "w-full lg:w-2/3"} transition-all duration-300`}
                    >
                        {/* Daily Prep Check-in above tabs */}
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

            {/* Footer */}
            <Suspense fallback={<LoadingSpinner />}>
                <Footer />
            </Suspense>

            {/* Modals */}
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
                    currentData={profile as any}
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

export default Dashboard;
