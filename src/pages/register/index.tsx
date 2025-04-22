import { FlexContainer, SEO, Text } from '@/components';
import { LoginRedirectButton } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import Image from 'next/image';

const Register = ({ seoMeta }: PageProps) => {
  return (
    <>
      <SEO seoMeta={seoMeta} />
      <FlexContainer className='min-h-screen lg:h-full'>
        <FlexContainer className='flex-col border-[1px]  border-[#B0B0B0] rounded-[5px] p-[26px] mb-5 lg:h-full md:w-[750px] lg:w-[900px]  '>
          <Text level='h1' className='text-[20px] font-bold md:text-4xl '>
            Start Your Boring Journey
          </Text>
          <FlexContainer className='my-[84px] md:w-[350px] '>
            <Image
              src='/images/login_illustration.png'
              alt='login illustration'
              width={273}
              height={214}
              className='w-full'
            />
          </FlexContainer>
          <LoginRedirectButton text='Login With Google' />
        </FlexContainer>
      </FlexContainer>
    </>
  );
};
export const getStaticProps = async (context: any) => {
  return {
    ...(await getPreFetchProps(context)),
    revalidate: 60,
  };
};
export default Register;
