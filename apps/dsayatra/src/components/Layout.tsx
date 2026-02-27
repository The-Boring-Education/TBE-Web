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
    const dashboardRoute = (router.pathname === '/' || router.pathname === '/login') ? '/' : '/dashboard';

    return (
        <Fragment>
            <Navbar
                variant="dsayatra"
                theme="dark"
                dashboardRoute={dashboardRoute}
            />


            <main className={cn("min-h-screen pt-[72px]", isDashboard && "bg-[#0f0f0f]")}>
                {children}
            </main>
            <Footer />
        </Fragment>
    );
};

export default Layout;
