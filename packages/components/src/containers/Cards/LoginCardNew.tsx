import { useAuth } from '@tbe/auth';
import { getLoginCardVariantConfig } from '@tbe/constants';
import { useAnalytics } from '@tbe/hooks';
import type { LoginCardNewProps } from '@tbe/interface';
import { trackEvent as sendEvent } from '@tbe/utils';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

import Text from '../../common/Typography/Text';
import Section from '../../layout/Section';
import FlexContainer from '../Page/common/FlexContainer';

const LoginCardNew = ({ variant = 'default', customRedirectPath }: LoginCardNewProps) => {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { signIn, isAuthenticated, isLoading } = useAuth();
    
    // Get variant configuration
    const variantConfig = useMemo(() => {
        const configs = getLoginCardVariantConfig();
        const config = configs[variant] || configs.default || configs.platform;
        if (!config) {
            // Fallback to default config if nothing is found
            return configs.default || configs.platform || {
                title: 'Welcome Back!',
                subtitle: 'Sign in to continue your tech learning journey',
                features: [],
                redirectPath: '/',
                termsHref: '/terms-and-conditions'
            };
        }
        return config;
    }, [variant]);

    // Determine redirect path
    const redirectPath = useMemo(() => {
        if (customRedirectPath) return customRedirectPath;
        if (router.query.redirect) return String(router.query.redirect);
        if (router.query.callbackUrl) return String(router.query.callbackUrl);
        return variantConfig.redirectPath || '/';
    }, [customRedirectPath, router.query, variantConfig.redirectPath]);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(redirectPath);
        }
    }, [isAuthenticated, router, redirectPath]);

    const handleGoogleSignIn = async () => {
        trackEvent({
            action: 'USER_LOGIN',
            category: 'User',
            label: 'User Logged In'
        });

        try {
            sendEvent('login_click', { category: 'auth', label: 'Continue with Google' });
        } catch {
            /* ignore analytics errors */
        }

        await signIn(redirectPath);
    };

    return (
        <Section className='md:px-4 md:py-4 px-2 py-2'>
            <FlexContainer className='m-auto' justifyCenter itemCenter>
                <motion.div
                    className='flex w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Left Section - Login Form */}
                    <div className='w-full md:w-1/2 p-4 md:p-3 flex border-1 border-gray-200 flex-col items-center justify-center text-center bg-white'>
                       <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Text level='h1' className='text-2xl md:text-3xl font-bold text-gray-900'>
                                {variantConfig.title}
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className='mt-2'
                        >
                            <Text level='p' className='text-sm text-gray-600'>
                                {variantConfig.subtitle}
                            </Text>
                        </motion.div>

                        <motion.button
                            className='mt-4 w-full flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer px-3 py-2 text-gray-700 font-medium'
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleSignIn}
                            disabled={isAuthenticated || isLoading}
                        >
                            <svg
                                className='w-4 mr-2 h-4'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                    fill='#4285F4'
                                />
                                <path
                                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                    fill='#34A853'
                                />
                                <path
                                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                    fill='#FBBC05'
                                />
                                <path
                                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                    fill='#EA4335'
                                />
                            </svg>
                            <span className='text-sm'>Continue with Google</span>
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className='mt-4 text-sm text-gray-500'
                        >
                            <Text level='p' className='text-xs text-gray-500'>
                                By signing in, you agree to our{' '}
                                <a 
                                    href={variantConfig.termsHref || '/terms-and-conditions'} 
                                    className='text-purple-600 hover:text-purple-700 underline'
                                >
                                    Terms and Conditions
                                </a>
                                {variantConfig.privacyHref && (
                                    <>
                                        {' '}and{' '}
                                        <a 
                                            href={variantConfig.privacyHref} 
                                            className='text-purple-600 hover:text-purple-700 underline'
                                        >
                                            Privacy Policy
                                        </a>
                                    </>
                                )}
                            </Text>
                        </motion.div>
                    </div>

                    {/* Right Section - Features */}
                    <div className='hidden md:flex md:w-1/2 flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white'>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Text level='h2' className='text-2xl md:text-2xl font-bold mb-6'>
                                {variantConfig.rightSectionTitle || 'Why TBE?'}
                            </Text>
                        </motion.div>

                        <div className='flex flex-col gap-4 flex-1 justify-center'>
                            {variantConfig.features.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className='flex items-start gap-4'
                                    >
                                        <div className='flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                                            <IconComponent className='w-5 h-5 p-1 text-white' />
                                        </div>
                                        <div>
                                            <Text level='h3' className='text-base font-semibold mb-1'>
                                                {feature.title}
                                            </Text>
                                            <Text level='p' className='text-xs text-white/90'>
                                                {feature.description}
                                            </Text>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className='flex items-center gap-2 text-sm text-white/90 mt-6'
                        >
                            <Rocket className='w-4 h-4' />
                            <Text level='p' className='text-xs'>
                                Join thousands of learners on their tech journey
                            </Text>
                        </motion.div>
                    </div>
                </motion.div>
            </FlexContainer>
        </Section>
    );
};

export default LoginCardNew;
