import {useGoogleLogin} from "@react-oauth/google";
import {useRouter} from "next/router";
import {motion} from "framer-motion";

import InstallButton from "@/components/features/InstallButton";
import {Button, Text, FlexContainer, Section} from "@tbe/components";
import {useAuth} from "@tbe/components";

const Auth = () => {
    const router = useRouter();
    const {signIn, loading} = useAuth();

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                // Get user info from Google
                const userInfo = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${response.access_token}`
                        }
                    }
                ).then((res) => res.json());

                // Sign in with our auth context
                await signIn(userInfo);
            } catch (error) {
                console.error("Error during Google login:", error);
            }
        },
        onError: (error) => {
            console.error("Google login error:", error);
        }
    });

    return (
        <div className='min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-10'>
                <motion.div
                    className='absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full'
                    animate={{y: [0, 20, 0]}}
                    transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                />
                <motion.div
                    className='absolute top-60 right-20 w-24 h-24 bg-primary/30 rounded-full'
                    animate={{y: [0, -20, 0]}}
                    transition={{duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1}}
                />
                <motion.div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/25 rounded-full'
                    animate={{y: [0, 15, 0]}}
                    transition={{duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2}}
                />
            </div>

            <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.6}}
                className='glass-dark rounded-2xl p-8 w-full max-w-md relative z-10'>
                <FlexContainer direction='col' className='text-center mb-8'>
                    <FlexContainer direction='col' className='mb-6'>
                        <Text level='span' className='text-3xl font-bold text-primary'>
                            PrepYatra
                        </Text>
                        <Text level='span' className='text-sm text-gray-400 mt-1'>
                            by The Boring Education
                        </Text>
                    </FlexContainer>
                    <Text level='h1' className='text-2xl font-bold text-white mb-2'>
                        Welcome Back!
                    </Text>
                    <Text level='p' className='text-gray-300'>
                        Sign in to continue your journey
                    </Text>
                </FlexContainer>

                <Button
                    text={loading ? "Signing in..." : "Continue with Google"}
                    onClick={() => login()}
                    disabled={loading}
                    variant='NEUTRAL'
                    className='w-full bg-white text-black hover:bg-gray-100 font-semibold py-1 px-4 rounded-lg transition-all duration-300 hover:scale-105 border-0'
                    icon={
                        <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                            <path
                                fill='#4285F4'
                                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                            />
                            <path
                                fill='#34A853'
                                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                            />
                            <path
                                fill='#FBBC05'
                                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                            />
                            <path
                                fill='#EA4335'
                                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                            />
                        </svg>
                    }
                    isLoading={loading}
                    animationType='BOUNCE'
                />

                <FlexContainer className='mt-6 text-center'>
                    <Text level='p' className='text-sm text-gray-400'>
                        By signing in, you agree to our Terms of Service and
                        Privacy Policy
                    </Text>
                </FlexContainer>
            </motion.div>
            <InstallButton />
        </div>
    );
};

export default Auth;
