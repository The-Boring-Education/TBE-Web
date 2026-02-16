import { Footer } from '@tbe/components';
import Navbar from './NoSSRNavbar';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const router = useRouter();

    // If on landing page or login page, logo should point to landing page
    const dashboardRoute = (router.pathname === '/' || router.pathname === '/login') ? '/' : '/dashboard';

    return (
        <Fragment>
            <Navbar
                variant="dsayatra"
                dashboardRoute={dashboardRoute}
            />


            <main className="min-h-screen pt-[72px]">
                {children}
            </main>
            <Footer />
        </Fragment>
    );
};

export default Layout;
