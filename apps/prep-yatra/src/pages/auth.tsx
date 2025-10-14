import { useAuth } from "@tbe/auth"
import { Button, FlexContainer,Text } from "@tbe/components"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import { useEffect } from "react"

import InstallButton from "@/components/features/InstallButton"

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
                    text={isLoading ? "Signing in..." : "Continue with GitHub"}
                    onClick={handleSignIn}
                    disabled={isLoading}
                    variant='NEUTRAL'
                    className='w-full text-lg text-white'
                    icon={
                        <svg
                            className='w-4 h-4 mr-2'
                            viewBox='0 0 24 24'
                            fill='currentColor'>
                            <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
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
