import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import {
  FlexContainer,
  Image,
  LoginWithGoogleButton,
  Logo,
  Section,
  Text,
} from '@/components';

const Login = () => {
  const { status } = useSession();
  const router = useRouter();
  const redirectPath = router.query.redirect
    ? String(router.query.redirect)
    : '/';

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectPath);
    }
  }, [status, router, redirectPath]);

  return (
    <Section>
      <FlexContainer className='m-auto'>
        <motion.div
          className='flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Section */}
          <div className='w-full md:w-1/2 p-4  md:p-8 flex flex-col items-start justify-start text-left'>
            <Logo />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Text level='h5' className='heading-5 font-bold mt-4'>
                Sign in to your account
              </Text>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Text level='p' className='paragraph text-gray-600 mt-2'>
                Continue with Google to access your account
              </Text>
            </motion.div>
            <motion.div
              className='mt-6'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LoginWithGoogleButton text='Login With Google' />
            </motion.div>
          </div>

          {/* Right Section with Image */}
          <FlexContainer className='hidden md:block md:w-1/2 relative'>
            <Image
              src='/images/loginpage.svg'
              alt='Login Page'
              className='rounded-r-lg'
            />
          </FlexContainer>
        </motion.div>
      </FlexContainer>
    </Section>
  );
};

export default Login;
