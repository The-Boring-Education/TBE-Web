import { RiAlarmWarningFill } from 'react-icons/ri';

import Layout from '@/components/layout/Section';
import SEO from '@/components/layout/SEO';
import { Link } from '@/components';
import { getSEOMeta } from '@/constant';

const NotFoundPage = () => {
  const seoMeta = getSEOMeta('/404');

  return (
    <Layout>
      <SEO seoMeta={seoMeta} />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
            <RiAlarmWarningFill
              size={60}
              className='drop-shadow-glow animate-flicker text-red-500'
            />
            <h1 className='mt-8 text-4xl md:text-6xl'>Page Not Found</h1>
            <Link className='mt-4 md:text-lg' href='/'>
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default NotFoundPage;
