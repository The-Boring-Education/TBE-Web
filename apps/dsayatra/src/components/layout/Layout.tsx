import { Footer } from "@tbe/components";
import { usePaymentStatus, useUser } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment } from "react";

import Navbar from "./NoSSRNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { user } = useUser();

  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: "lifetime",
    productType: "DSA_YATRA",
    isPremium: true,
  });

  const isDashboard =
    router.pathname === "/dashboard" ||
    router.pathname.startsWith("/dashboard/");
  const isFullScreen = router.pathname === "/sheets";
  /** Pricing is a distraction-free page (no nav/footer); content supplies its own back control. */
  const isPricingStandalone = router.pathname === "/pricing";
  /** Public journey uses Prep Yatra nav/footer from the page component. */
  const isPublicJourney = router.pathname === "/journey/[username]";
  const isRevisions = router.pathname === "/revisions";
  const isTopics = router.pathname === "/topics";
  const isLandingPage = router.pathname === "/";
  const dashboardRoute =
    router.pathname === "/" || router.pathname === "/login"
      ? "/"
      : "/dashboard";

  if (isFullScreen || isPricingStandalone || isPublicJourney) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Fragment>
      <Navbar
        variant="dsayatra"
        theme="dark"
        dashboardRoute={dashboardRoute}
        hidePricingLink={isPurchased === true}
        profileRoute="/profile"
      />

      <main
        className={cn(
          "min-h-screen w-full overflow-x-hidden pt-[72px]",
          (isDashboard || isRevisions || isTopics) && "bg-[#0A0A0A]",
          isLandingPage && "bg-[#040505]",
        )}
      >
        {children}
      </main>
      <Footer />
    </Fragment>
  );
};

export default Layout;
