import { Footer, Navbar } from '@/components';
import { PageLayoutProps } from '@/interfaces';

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <main className='bg-lightBG'>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
};

export default PageLayout;
