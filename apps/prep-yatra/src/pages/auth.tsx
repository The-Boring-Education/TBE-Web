import { useAuth } from "@tbe/auth"
import { Button, FlexContainer, Text } from "@tbe/components"
import {InstallButton} from "@tbe/components"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Auth = () => {
    const router = useRouter()
    const { signIn, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        // Redirect if already authenticated - let _app.tsx handle onboarding check
        if (!isLoading && isAuthenticated) {
            const callbackUrl =
                (router.query.callbackUrl as string) || "/dashboard"
            router.replace(callbackUrl)
        }
    }, [isAuthenticated, isLoading, router])

    const handleSignIn = () => {
        const callbackUrl = (router.query.callbackUrl as string) || "/dashboard"
        signIn(callbackUrl)
    }

    // Show nothing while checking or redirecting
    if (isAuthenticated) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
            </div>
        )
    }

    return (
        <div className='min-h-screen flex items-center justify-center px-3 relative overflow-hidden bg-lightBG'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-5'>
                <motion.div
                    className='absolute top-20 left-10 w-32 h-32 bg-primary/30 rounded-full'
                    animate={{ y: [0, 20, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className='absolute top-60 right-20 w-24 h-24 bg-secondary/40 rounded-full'
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/35 rounded-full'
                    animate={{ y: [0, 15, 0] }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className='glass rounded-1 p-6 w-full max-w-md relative z-10 shadow'>
                <FlexContainer direction='col' className='text-center mb-4'>
                    <FlexContainer direction='col' className='mb-6'>
                        <Text
                            level='span'
                            className='text-3xl font-bold text-primary'>
                            PrepYatra
                        </Text>
                        <Text
                            level='span'
                            className='text-sm text-greyDark mt-1'>
                            by The Boring Education
                        </Text>
                    </FlexContainer>
                    <Text level='h1' className='text-2xl font-semibold mb-2'>
                        Welcome Back!
                    </Text>
                    <Text level='p' className='text-sm text-greyDark'>
                        Sign in to continue your journey
                    </Text>
                </FlexContainer>

                <Button
                    text={isLoading ? "Signing in..." : "Continue with Google"}
                    onClick={handleSignIn}
                    disabled={isLoading}
                    variant='NEUTRAL'
                    size="SMALL"
                    className='w-full text-lg text-white'
                    icon={
                        <svg
                            className='w-4 h-4 mr-2'
                            viewBox='0 0 24 24'
                            fill='currentColor'>
                            <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
                            <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
                            <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
                            <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
                        </svg>
                    }
                    isLoading={isLoading}
                    animationType='BOUNCE'
                />

                <FlexContainer className='mt-6 text-center'>
                    <Text level='p' className='text-sm text-greyDark'>
                        By signing in, you agree to our Terms of Service and
                        Privacy Policy
                    </Text>
                </FlexContainer>
            </motion.div>
            <InstallButton />
        </div>
    )
}

export default Auth
