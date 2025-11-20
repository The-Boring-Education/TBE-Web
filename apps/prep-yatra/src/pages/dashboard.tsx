import { useAuth } from "@tbe/auth"
import { DashboardTabs, LoadingSpinner, ProfileSection } from "@tbe/components"
import { usePrepYatraGamificationContext } from "@tbe/components"
import { usePrepLogs } from "@tbe/hooks"
import { recruitersService } from "@tbe/services"
import type { RecruiterContact } from "@tbe/types"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/router"
import React, { lazy, Suspense, useEffect, useState } from "react"
import { toast } from "sonner"

// Dashboard Components

// Lazy load components for better performance
const Navbar = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.Navbar
    }))
)
const AddPrepLogModal = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.AddPrepLogModal
    }))
)
const AddRecruiterModal = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.AddRecruiterModal
    }))
)
const EditOnboardingModal = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.EditOnboardingModal
    }))
)

const BuildYourStack = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.BuildYourStack
    }))
)
const DailyPrepEncouragement = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.DailyPrepEncouragement
    }))
)

const AddSkillsModal = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.AddSkillsModal
    }))
)
const PrepYatraFooter = lazy(() =>
    import("@tbe/components").then((module) => ({
        default: module.PrepYatraFooter
    }))
)

// Loading component for Suspense fallback
const ComponentLoader = () => (
    <div className='flex items-center justify-center h-32'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
    </div>
)

// Type definitions

type Profile = {
    _id?: string
    name?: string
    userName?: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    image?: string
    userSkills?: string[]
    userSkillsLastUpdated?: string
    prepYatra?: {
        experienceLevel?: string
        goal?: string
        skills?: string[]
        targetCompanies?: string[]
        preferences?: {
            focusAreas?: string[]
            interviewCategories?: string[]
        }
    }
    createdAt?: string
    occupation?: string
    purpose?: string[]
}

const Dashboard = () => {
    const router = useRouter()
    const { user, isLoading: authLoading, signOut } = useAuth()
    const { showCelebration } = usePrepYatraGamificationContext()
    const {
        logs: prepLogs,
        loading: prepLogsLoading,
        refetch: refetchPrepLogs,
        setLogs: setPrepLogs
    } = usePrepLogs(user?.id)

    // State management
    const [profile, setProfile] = useState<Profile | null>(null)
    const [recruiterContacts, setRecruiterContacts] = useState<
        RecruiterContact[]
    >([])
    const [loading, setLoading] = useState(true)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    // Modal states
    const [isPrepLogModalOpen, setIsPrepLogModalOpen] = useState(false)
    const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false)

    // Data fetching functions
    const fetchProfile = async (userId: string) => {
        console.log("fetchProfile called with userId:", userId)
        try {
            const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(
                /\/$/,
                ""
            )
            const url = `${base}/user?userId=${encodeURIComponent(userId)}`
            console.log("Fetching profile from URL:", url)
            const response = await fetch(url)
            console.log("Profile response status:", response.status)
            if (response.ok) {
                const result = await response.json()
                console.log("Profile result:", result)
                // Extract data from the API response structure
                if (result.status && result.data) {
                    setProfile(result.data)
                } else {
                    setProfile(result)
                }
            } else {
                console.error(
                    "Profile fetch failed with status:",
                    response.status
                )
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
    }

    const fetchRecruiterContacts = async (userId: string) => {
        try {
            const contacts = await recruitersService.getByUserId(userId)
            setRecruiterContacts(contacts)
        } catch (error) {
            console.error("Error fetching recruiter contacts:", error)
        }
    }

    const initializeData = async () => {
        console.log("initializeData called with user:", user)
        if (!user?.id) {
            console.log("No user ID, returning from initializeData")
            return
        }

        console.log("Starting data initialization for user ID:", user.id)
        setLoading(true)
        try {
            await Promise.all([
                fetchProfile(user.id),
                fetchRecruiterContacts(user.id)
            ])
            console.log("Data initialization completed")
        } catch (error) {
            console.error("Error initializing data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Effects
    useEffect(() => {
        console.log(
            "Dashboard useEffect - authLoading:",
            authLoading,
            "user:",
            user
        )
        if (authLoading) return

        if (user) {
            console.log("User found, initializing data...")
            // Initialize data (auth and onboarding checks are handled by ProtectedRoute and _app.tsx)
            initializeData()
        } else {
            console.log("No user found, not initializing data")
        }
    }, [user, authLoading])

    // Event handlers
    const handleSignOut = async () => {
        try {
            await signOut()
            router.push("/")
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    const handleLogAdded = () => {
        if (user?.id) {
            // Only refetch prep logs, not everything
            refetchPrepLogs()
            showCelebration(10)
            toast.success("Prep log added successfully!")
        }
    }

    const handleContactAdded = () => {
        if (user?.id) {
            // Only refetch recruiter contacts, not everything
            fetchRecruiterContacts(user.id)
            showCelebration(5)
            toast.success("Recruiter contact added successfully!")
        }
    }

    const handleContactUpdated = () => {
        if (user?.id) {
            // Only refetch recruiter contacts, not everything
            fetchRecruiterContacts(user.id)
        }
    }

    const handleLogDeleted = (deletedLogId: string) => {
        // Immediately remove the deleted log from local state
        setPrepLogs((prevLogs) =>
            prevLogs.filter((log) => log._id !== deletedLogId)
        )
        toast.success("Prep log deleted successfully!")
    }

    const handleContactDeleted = (deletedContactId: string) => {
        // Immediately remove the deleted contact from local state
        setRecruiterContacts((prevContacts) =>
            prevContacts.filter((contact) => contact._id !== deletedContactId)
        )
        toast.success("Recruiter contact deleted successfully!")
    }

    const handleSkillsUpdated = () => {
        if (user?.id) {
            // Only refetch profile, not everything
            fetchProfile(user.id)
            toast.success("Skills updated successfully!")
        }
    }

    if (loading || authLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <Suspense fallback={<ComponentLoader />}>
                <Navbar variant='prepyatra' />
            </Suspense>

            <main className='w-full px-2 md:px-4 pt-[72px] pb-6'>
                {/* Mobile backdrop */}
                {!isSidebarCollapsed && (
                    <div
                        className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                {/* Sidebar Toggle Button - Mobile */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className='fixed top-[78px] left-3 z-50 lg:hidden bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110'>
                    {isSidebarCollapsed ? (
                        <Menu className='w-3.5 h-3.5' />
                    ) : (
                        <X className='w-3.5 h-3.5' />
                    )}
                </button>

                {/* Sidebar Toggle Button - Desktop */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className='hidden lg:flex fixed top-[78px] left-3 z-50 bg-primary text-white shadow-lg hover:shadow-xl border-2 border-primary hover:bg-primary/90 items-center justify-center h-9 w-9 rounded-full transition-all duration-200 hover:scale-110'>
                    {isSidebarCollapsed ? (
                        <Menu className='w-3.5 h-3.5' />
                    ) : (
                        <X className='w-3.5 h-3.5' />
                    )}
                </button>

                <div className='flex gap-6'>
                    {/* Profile Section - Collapsible Sidebar */}
                    <div
                        className={`${isSidebarCollapsed ? "hidden" : "block"} w-full lg:w-1/3 transition-all duration-300`}>
                        <ProfileSection
                            user={user}
                            profile={profile}
                            onEditClick={() => setIsEditModalOpen(true)}
                        />

                        {/* Additional components */}
                        <Suspense fallback={<ComponentLoader />}>
                            <BuildYourStack
                                userId={user.id || ""}  
                                userSkills={profile?.userSkills || []}
                                lastUpdated={profile?.userSkillsLastUpdated}
                            />
                        </Suspense>
                    </div>

                    {/* Main Content */}
                    <div
                        className={`${isSidebarCollapsed ? "w-full" : "w-full lg:w-2/3"} transition-all duration-300`}>
                        {/* Daily Prep Check-in above tabs */}
                        <Suspense fallback={<ComponentLoader />}>
                            <div className='mb-4'>
                                <DailyPrepEncouragement
                                    userId={user?.id || ""}
                                    onAddPrepLog={() =>
                                        setIsPrepLogModalOpen(true)
                                    }
                                />
                            </div>
                        </Suspense>

                        <DashboardTabs
                            prepLogs={prepLogs}
                            recruiterContacts={recruiterContacts}
                            user={user}
                            profile={profile}
                            onPrepLogModalOpen={() =>
                                setIsPrepLogModalOpen(true)
                            }
                            onRecruiterModalOpen={() =>
                                setIsRecruiterModalOpen(true)
                            }
                            onSkillsModalOpen={() => setIsSkillsModalOpen(true)}
                            onContactUpdated={handleContactUpdated}
                            onLogDeleted={handleLogDeleted}
                            onContactDeleted={handleContactDeleted}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Suspense fallback={<ComponentLoader />}>
                <PrepYatraFooter />
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
                    onUpdate={() => {
                        if (user?.id) {
                            fetchProfile(user.id)
                        }
                    }}
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
    )
}

export default Dashboard
