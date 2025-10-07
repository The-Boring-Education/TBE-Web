import { useRouter } from "next/router"
import React, { useState, useEffect, Suspense, lazy } from "react"
import { toast } from "sonner"
import { Menu, X } from "lucide-react"

import {
    ProfileSection,
    DashboardTabs,
    LoadingSpinner
} from "@tbe/components"
import { usePrepYatraGamificationContext } from "@tbe/components"
import { useAuth } from "@tbe/components"
import { usePrepLogs } from "@tbe/hooks"
import { recruitersService } from "@tbe/services"
import { RecruiterContact } from "@tbe/types"
import { Button } from "@tbe/components"

// Dashboard Components

// Lazy load components for better performance
const PrepYatraNavbar = lazy(() => import("@tbe/components").then(module => ({ default: module.PrepYatraNavbar })))
const AddPrepLogModal = lazy(
    () => import("@tbe/components").then(module => ({ default: module.AddPrepLogModal }))
)
const AddRecruiterModal = lazy(
    () => import("@tbe/components").then(module => ({ default: module.AddRecruiterModal }))
)
const EditOnboardingModal = lazy(
    () => import("@tbe/components").then(module => ({ default: module.EditOnboardingModal }))
)
const GamificationDisplay = lazy(
    () => import("@tbe/components").then(module => ({ default: module.GamificationDisplay }))
)
const BuildYourStack = lazy(
    () => import("@tbe/components").then(module => ({ default: module.BuildYourStack }))
)
const DailyPrepEncouragement = lazy(
    () => import("@tbe/components").then(module => ({ default: module.DailyPrepEncouragement }))
)
const SubscriptionInterestPopover = lazy(
    () => import("@tbe/components").then(module => ({ default: module.SubscriptionInterestPopover }))
)
const AddSkillsModal = lazy(() => import("@tbe/components").then(module => ({ default: module.AddSkillsModal })))



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
    const { user, loading: authLoading, signOut } = useAuth()
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
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user?userId=${userId}`
            )
            if (response.ok) {
                const result = await response.json()
                // Extract data from the API response structure
                if (result.status && result.data) {
                    setProfile(result.data)
                } else {
                    setProfile(result)
                }
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
        if (!user?.id) {
            return
        }

        setLoading(true)
        try {
            await Promise.all([
                fetchProfile(user.id),
                fetchRecruiterContacts(user.id)
            ])
        } catch (error) {
            console.error("Error initializing data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Effects
    useEffect(() => {
        const checkAuthAndProfile = async () => {
            if (authLoading) {
                return
            }

            if (!user) {
                router.push("/auth")
                return
            }

            try {
                // Check if user needs onboarding
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user?userId=${user.id}`
                )
                if (!response.ok) {
                    const onboardingUrl = process.env.NEXT_PUBLIC_ONBOARDING_URL
                    if (onboardingUrl) {
                        const redirectUrl = `${onboardingUrl}?userId=${user.id}&from=prepyatra&redirect=${encodeURIComponent(window.location.origin + "/dashboard")}`
                        window.location.href = redirectUrl
                    } else {
                        router.push("/onboarding")
                    }
                    return
                }

                const result = await response.json()
                // Check if user is onboarded based on API response
                if (result.status && result.data) {
                    if (
                        !result.data.isOnboarded &&
                        !result.data.prepYatra?.pyOnboarded
                    ) {
                        const onboardingUrl =
                            process.env.NEXT_PUBLIC_ONBOARDING_URL
                        if (onboardingUrl) {
                            const redirectUrl = `${onboardingUrl}?userId=${user.id}&from=prepyatra&redirect=${encodeURIComponent(window.location.origin + "/dashboard")}`
                            window.location.href = redirectUrl
                        } else {
                            router.push("/onboarding")
                        }
                        return
                    }
                }

                initializeData()
            } catch (error) {
                console.error("Error checking onboarding status:", error)
                initializeData()
            }
        }

        checkAuthAndProfile()
    }, [user, router, authLoading])

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
                <PrepYatraNavbar
                    username={user?.name || ""}
                    onSignOut={handleSignOut}
                    userId={user?.id}
                />
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
                <Button
                    variant='PRIMARY'
                    text=""
                    className='fixed top-[76px] left-3 z-50 lg:hidden bg-primary text-primary-foreground shadow border border-primary/30 text-sm px-2 py-2'
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    icon={isSidebarCollapsed ? <Menu className='w-4 h-4' /> : <X className='w-4 h-4' />}
                />

                {/* Sidebar Toggle Button - Desktop */}
                <Button
                    variant='PRIMARY'
                    text=""
                    className='hidden lg:flex fixed top-[76px] left-3 z-50 bg-primary text-primary-foreground shadow border border-primary/30 text-sm px-2 py-2'
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    icon={isSidebarCollapsed ? <Menu className='w-4 h-4' /> : <X className='w-4 h-4' />}
                />

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
                                userId={user?.id || ""}
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
