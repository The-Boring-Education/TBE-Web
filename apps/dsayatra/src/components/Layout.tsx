import { Footer } from '@tbe/components';
import { cn } from '@tbe/utils';
import Navbar from './NoSSRNavbar';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const router = useRouter();

    // If on landing page or login page, logo should point to landing page
    const isDashboard = router.pathname === '/dashboard' || router.pathname.startsWith('/dashboard/');
    const isFullScreen = router.pathname === '/sheets';
    const dashboardRoute = (router.pathname === '/' || router.pathname === '/login') ? '/' : '/dashboard';

    return (
        <Fragment>
            <Navbar
                variant="dsayatra"
                theme="dark"
                dashboardRoute={dashboardRoute}
            />


            <main className={cn(isFullScreen ? "h-screen pt-[72px] overflow-hidden" : "min-h-screen pt-[72px]", (isDashboard || isFullScreen) && "bg-[#0f0f0f]")}>
                {children}
            </main>
            {!isFullScreen && <Footer />}
        </Fragment>
    );
};

export default Layout;
