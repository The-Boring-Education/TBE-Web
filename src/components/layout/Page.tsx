import { Footer, Navbar } from '@/components';
import { PageLayoutProps } from '@/interfaces';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const PageLayout = ({ children }: PageLayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up the event listener when the component unmounts
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <main className='bg-lightBG flex flex-col min-h-screen'>
      <Navbar />
      <div className='flex-1'>{children}</div>
      <Footer />
    </main>
  );
};

export default PageLayout;
