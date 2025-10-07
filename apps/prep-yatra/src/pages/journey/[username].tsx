import {
    Calendar,
    Clock,
    User,
    Target,
    TrendingUp,
    Linkedin,
    Github,
    ExternalLink
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import {PrepYatraFooter} from "@tbe/components"
import {PrepYatraNavigation} from "@tbe/components"
import { Badge } from "@tbe/components"
import { Button, Text, FlexContainer, Section, GridContainer, IconCard } from "@tbe/components"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@tbe/components"

interface PrepLog {
    _id: string
    title: string
    description?: string
    timeSpent: number
    createdAt: string
}

interface UserProfile {
    name: string
    userName: string
    createdAt: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    userSkills?: string[]
    userSkillsLastUpdated?: string
    occupation?: string
    purpose?: string[]
    prepYatra: {
        goal?: string
        experienceLevel?: string
        pyOnboarded?: boolean
        targetCompanies?: string[]
        preferences?: {
            interviewCategories?: string[]
            focusAreas?: string[]
        }
    }
}

const PrepLogsShowcase = () => {
    const router = useRouter()
    const { username } = router.query
    const [prepLogs, setPrepLogs] = useState<PrepLog[]>([])
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    const formatTimeSpent = (hours: number) => {
        if (hours < 1) {
            return `${Math.round(hours * 60)} minutes`
        }
        return `${hours} hour${hours !== 1 ? "s" : ""}`
    }

    const getTimeOfDay = () => {
        const hour = new Date().getHours()
        if (hour < 12) {
            return "Good morning"
        }
        if (hour < 17) {
            return "Good afternoon"
        }
        return "Good evening"
    }

    // Utility function to add protocol to URLs
    function withProtocol(url: string | undefined) {
        if (!url) {
            return undefined
        }

        return url.startsWith("http") ? url : `https://${url}`
    }

    const handleGetStarted = () => {
        router.push("/auth")
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) {
                return
            }

            try {
                setLoading(true)

                // Fetch user profile by username
                const profileResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user?username=${username}`
                )

                if (!profileResponse.ok) {
                    throw new Error("User not found")
                }

                const profileData = await profileResponse.json()
                // Extract data from the API response structure
                if (profileData.status && profileData.data) {
                    setProfile(profileData.data)
                } else {
                    setProfile(profileData)
                }

                // Fetch prep logs using the userId from the profile data
                if (profileData.data?._id || profileData._id) {
                    const userId = profileData.data?._id || profileData._id
                    const logsResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/prep-log?userId=${userId}`
                    )

                    if (logsResponse.ok) {
                        const logsData = await logsResponse.json()
                        // Extract data from the API response structure
                        if (logsData.status && logsData.data) {
                            setPrepLogs(logsData.data || [])
                        } else {
                            setPrepLogs(logsData || [])
                        }
                    }
                }
            } catch (err) {
                setError("Failed to load user profile")
                console.error("Error fetching data:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [username])

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className='min-h-screen bg-background'>
                <PrepYatraNavigation />
                <Section className='container mx-auto px-4 py-16 text-center'>
                    <Text level='h1' className='text-4xl font-bold text-foreground mb-4'>
                        User Not Found
                    </Text>
                    <Text level='p' className='text-muted-foreground mb-8'>
                        The user profile you're looking for doesn't exist or has
                        been made private.
                    </Text>
                    <Button 
                        text='Start Your Own Journey'
                        onClick={handleGetStarted}
                        variant='PRIMARY'
                    />
                </Section>
                <PrepYatraFooter />
            </div>
        )
    }

    const totalTimeSpent = prepLogs.reduce(
        (total, log) => total + log.timeSpent,
        0
    )
    const totalLogs = prepLogs.length

    return (
        <div className='min-h-screen bg-background'>
            <PrepYatraNavigation />

            <Section className='container mx-auto px-4 mt-12 px-6 lg:px-8 py-8 md:py-12 lg:py-16'>
                {/* Header Section */}
                <FlexContainer direction='col' className='text-center mb-12 sm:mb-16 lg:mb-20 mt-4 sm:mt-8'>
                    <Text level='h1' className='text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6'>
                        {getTimeOfDay()}! Meet{" "}
                        <span className='text-primary'>{profile.name}</span>
                    </Text>
                    <Text level='p' className='text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto'>
                        Following their interview preparation journey on
                        PrepYatra
                    </Text>

                    {/* Stats Cards */}
                    <GridContainer className='grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12'>
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6}}>
                            <Card className='hover:shadow-lg transition-shadow duration-300'>
                                <CardContent className='flex items-center justify-center p-4 sm:p-6'>
                                    <FlexContainer direction='col' className='text-center'>
                                        <FlexContainer className='mb-2'>
                                            <Target className='w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2' />
                                            <Text level='span' className='text-xl sm:text-2xl lg:text-3xl font-bold'>
                                                {totalLogs}
                                            </Text>
                                        </FlexContainer>
                                        <Text level='p' className='text-xs sm:text-sm text-muted-foreground'>
                                            Prep Sessions
                                        </Text>
                                    </FlexContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6, delay: 0.1}}>
                            <Card className='hover:shadow-lg transition-shadow duration-300'>
                                <CardContent className='flex items-center justify-center p-4 sm:p-6'>
                                    <FlexContainer direction='col' className='text-center'>
                                        <FlexContainer className='mb-2'>
                                            <Clock className='w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2' />
                                            <Text level='span' className='text-xl sm:text-2xl lg:text-3xl font-bold'>
                                                {Math.round(totalTimeSpent)}
                                            </Text>
                                        </FlexContainer>
                                        <Text level='p' className='text-xs sm:text-sm text-muted-foreground'>
                                            Hours Invested
                                        </Text>
                                    </FlexContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.6, delay: 0.2}}>
                            <Card className='hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1'>
                                <CardContent className='flex items-center justify-center p-4 sm:p-6'>
                                    <FlexContainer direction='col' className='text-center'>
                                        <FlexContainer className='mb-2'>
                                            <TrendingUp className='w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2' />
                                            <Badge
                                                variant='secondary'
                                                className='text-sm sm:text-base px-2 sm:px-3 py-1'>
                                                {profile.prepYatra
                                                    .experienceLevel || "Learning"}
                                            </Badge>
                                        </FlexContainer>
                                        <Text level='p' className='text-xs sm:text-sm text-muted-foreground'>
                                            Experience Level
                                        </Text>
                                    </FlexContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </GridContainer>
                </FlexContainer>

                {/* User Skills Section */}
                {profile.userSkills && profile.userSkills.length > 0 && (
                    <div className='max-w-4xl mx-auto mb-8 sm:mb-12'>
                        <Card className='hover:shadow-lg transition-shadow duration-300'>
                            <CardHeader className='text-center pb-4 sm:pb-6'>
                                <CardTitle className='text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3'>
                                    🚀 Tech Stack
                                </CardTitle>
                                <CardDescription>
                                    {profile.userSkillsLastUpdated && (
                                        <span className='text-xs sm:text-sm text-muted-foreground'>
                                            Last updated:{" "}
                                            {formatDate(
                                                profile.userSkillsLastUpdated
                                            )}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='px-4 sm:px-6 pb-6 sm:pb-8'>
                                <div className='flex flex-wrap justify-center gap-2 sm:gap-3'>
                                    {profile.userSkills.map((skill, index) => (
                                        <Badge
                                            key={index}
                                            variant='secondary'
                                            className='px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors duration-200'>
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Profile Info */}
                <Card className='max-w-2xl mx-auto mb-8 sm:mb-12 hover:shadow-lg transition-shadow duration-300'>
                    <CardHeader className='text-center pb-4 sm:pb-6'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6'>
                            <User className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary' />
                        </div>
                        <CardTitle className='text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4'>
                            {profile.name}
                        </CardTitle>
                        <CardDescription className='text-base sm:text-lg mb-4 sm:mb-6'>
                            @{profile.userName}
                        </CardDescription>

                        {/* Social Media Links */}
                        {(profile.linkedInUrl ||
                            profile.githubUrl ||
                            profile.leetCodeUrl) && (
                            <div className='flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6'>
                                {profile.linkedInUrl && (
                                    <a
                                        href={withProtocol(
                                            profile.linkedInUrl
                                        )}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center'>
                                        <Linkedin className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    </a>
                                )}
                                {profile.githubUrl && (
                                    <a
                                        href={withProtocol(
                                            profile.githubUrl
                                        )}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center'>
                                        <Github className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    </a>
                                )}
                                {profile.leetCodeUrl && (
                                    <a
                                        href={withProtocol(
                                            profile.leetCodeUrl
                                        )}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-10 h-10 sm:w-12 sm:h-12 border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-md border flex items-center justify-center'>
                                        <ExternalLink className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                    </a>
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className='text-center space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base'>
                            <div className='bg-gray-50/5 rounded-lg p-3 sm:p-4'>
                                <span className='font-medium text-foreground'>
                                    Journey Started:
                                </span>
                                <br />
                                <span className='text-muted-foreground'>
                                    {formatDate(profile.createdAt)}
                                </span>
                            </div>
                            <div className='bg-gray-50/5 rounded-lg p-3 sm:p-4'>
                                <span className='font-medium text-foreground'>
                                    Goal:
                                </span>
                                <br />
                                <span className='text-muted-foreground'>
                                    {profile.prepYatra.goal || "Not specified"}
                                </span>
                            </div>
                        </div>

                        {/* Additional Profile Info */}
                        {(profile.occupation || profile.purpose) && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base pt-4 sm:pt-6'>
                                {profile.occupation && (
                                    <div className='bg-gray-50/5 rounded-lg p-3 sm:p-4'>
                                        <span className='font-medium text-foreground'>
                                            Occupation:
                                        </span>
                                        <br />
                                        <span className='text-muted-foreground'>
                                            {profile.occupation.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>
                                    </div>
                                )}
                                {profile.purpose &&
                                    profile.purpose.length > 0 && (
                                        <div className='bg-gray-50/5 rounded-lg p-3 sm:p-4'>
                                            <span className='font-medium text-foreground'>
                                                Purpose:
                                            </span>
                                            <br />
                                            <span className='text-muted-foreground'>
                                                {profile.purpose
                                                    .map((p) =>
                                                        p.replace("_", " ")
                                                    )
                                                    .join(", ")}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Prep Logs */}
                <div className='max-w-5xl mx-auto mb-8 sm:mb-12'>
                    <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8'>
                        Recent Preparation Sessions
                    </h2>

                    {prepLogs.length === 0 ? (
                        <Card className='hover:shadow-lg transition-shadow duration-300'>
                            <CardContent className='text-center py-12 sm:py-16'>
                                <p className='text-muted-foreground text-base sm:text-lg'>
                                    No preparation logs shared yet. Check back
                                    later!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='grid gap-4 sm:gap-6'>
                            {prepLogs.slice(0, 10).map((log) => (
                                <Card
                                    key={log._id}
                                    className='hover:shadow-lg transition-shadow duration-300'>
                                    <CardHeader className='pb-3 sm:pb-4'>
                                        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4'>
                                            <div className='flex-1'>
                                                <CardTitle className='text-base sm:text-lg lg:text-xl mb-2 sm:mb-3'>
                                                    {log.title}
                                                </CardTitle>
                                                <CardDescription className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm'>
                                                    <div className='flex items-center'>
                                                        <Calendar className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                                                        {formatDate(
                                                            log.createdAt
                                                        )}
                                                    </div>
                                                    <div className='flex items-center'>
                                                        <Clock className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                                                        {formatTimeSpent(
                                                            log.timeSpent
                                                        )}
                                                    </div>
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant='outline'
                                                className='self-start sm:self-auto text-xs sm:text-sm px-2 sm:px-3 py-1'>
                                                {formatTimeSpent(log.timeSpent)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    {log.description && (
                                        <CardContent className='pt-0 pb-4 sm:pb-6'>
                                            <p className='text-muted-foreground text-sm sm:text-base leading-relaxed'>
                                                {log.description}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <FlexContainer className='text-center mt-12 sm:mt-16 lg:mt-20'>
                    <Card className='max-w-3xl mx-auto hover:shadow-lg transition-shadow duration-300'>
                        <CardContent className='p-6 sm:p-8 lg:p-10'>
                            <Text level='h3' className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6'>
                                Start Your Own PrepYatra Journey
                            </Text>
                            <Text level='p' className='text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed'>
                                Track your interview preparation, connect with
                                recruiters, and showcase your progress just like{" "}
                                <span className='text-primary font-medium'>
                                    {profile.name}
                                </span>
                                !
                            </Text>
                            <Button
                                text='Get Started for Free'
                                onClick={handleGetStarted}
                                variant='PRIMARY'
                                className='px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg hover:scale-105 transition-transform duration-200'
                            />
                        </CardContent>
                    </Card>
                </FlexContainer>
            </Section>

            <PrepYatraFooter />
        </div>
    )
}

export default PrepLogsShowcase
