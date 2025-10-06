import {useGoogleLogin} from "@react-oauth/google";
import {useRouter} from "next/router";

import InstallButton from "@/components/features/InstallButton";
import {Button} from "@/components/ui/button";
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
        <div className='min-h-screen flex items-center justify-center px-4 relative overflow-hidden'>
            {/* Background Animation Elements */}
            <div className='absolute inset-0 opacity-10'>
                <div className='absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full animate-float' />
                <div
                    className='absolute top-60 right-20 w-24 h-24 bg-primary/30 rounded-full animate-float'
                    style={{animationDelay: "1s"}} />
                <div
                    className='absolute bottom-40 left-1/4 w-20 h-20 bg-primary/25 rounded-full animate-float'
                    style={{animationDelay: "2s"}} />
            </div>

            <div className='glass-dark rounded-2xl p-8 w-full max-w-md animate-scale-in relative z-10'>
                <div className='text-center mb-8'>
                    <div className='text-center mb-6'>
                        <span className='block text-3xl font-bold text-primary'>
                            PrepYatra
                        </span>
                        <span className='block text-sm text-gray mt-1'>
                            by The Boring Education
                        </span>
                    </div>
                    <h1 className='text-2xl font-bold text-white mb-2'>
                        Welcome Back!
                    </h1>
                    <p className='text-gray'>
                        Sign in to continue your journey
                    </p>
                </div>

                <Button
                    onClick={() => login()}
                    disabled={loading}
                    className='w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105'>
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
                    {loading ? "Signing in..." : "Continue with Google"}
                </Button>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-400'>
                        By signing in, you agree to our Terms of Service and
                        Privacy Policy
                    </p>
                </div>
            </div>
            <InstallButton />
        </div>
    );
};

export default Auth;
