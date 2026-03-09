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

    const isDashboard = router.pathname === '/dashboard' || router.pathname.startsWith('/dashboard/');
    const isFullScreen = router.pathname === '/sheets';
    const isRevisions = router.pathname === '/revisions';
    const dashboardRoute = (router.pathname === '/' || router.pathname === '/login') ? '/' : '/dashboard';

    return (
        <Fragment>
            <Navbar
                variant="dsayatra"
                theme="dark"
                dashboardRoute={dashboardRoute}
            />


            <main className={cn(isFullScreen ? "h-screen pt-[72px] overflow-hidden" : "min-h-screen pt-[72px]", (isDashboard || isFullScreen || isRevisions) && "bg-[#0A0A0A]")}>
                {children}
            </main>
            {!isFullScreen && <Footer />}
        </Fragment>
    );
};

export default Layout;
