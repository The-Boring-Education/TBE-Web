import { Footer } from "@tbe/components";
import { cn } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment } from "react";

import Navbar from "./NoSSRNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();

  const isDashboard =
    router.pathname === "/dashboard" ||
    router.pathname.startsWith("/dashboard/");
  const isFullScreen = router.pathname === "/sheets";
  const isRevisions = router.pathname === "/revisions";
  const isTopics = router.pathname === "/topics";
  const dashboardRoute =
    router.pathname === "/" || router.pathname === "/login"
      ? "/"
      : "/dashboard";

  if (isFullScreen) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Fragment>
      <Navbar variant="dsayatra" theme="dark" dashboardRoute={dashboardRoute} />

      <main
        className={cn(
          "min-h-screen pt-[72px]",
          (isDashboard || isRevisions || isTopics || router.pathname === "/") &&
            "bg-[#0A0A0A]",
        )}
      >
        {children}
      </main>
      <Footer />
    </Fragment>
  );
};

export default Layout;
