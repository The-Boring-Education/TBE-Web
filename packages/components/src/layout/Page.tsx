import { routes } from "@tbe/constants";
import type { PageLayoutProps } from "@tbe/interface";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ThemeToggle, useHasThemeProvider } from "../common/Theme";
import Footer from "./Footer";
import Navbar from "./Navbar";

const PageLayout = ({ children }: PageLayoutProps) => {
  let router: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // App Router or RouterContext not mounted
  }
  const [isClient, setIsClient] = useState(false);
  const hasThemeProvider = useHasThemeProvider();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !router?.events) return;

    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [isClient, router?.events]);

  const isProfileRoute =
    router?.pathname === "/profile" ||
    router?.pathname === "/user/profile" ||
    Boolean(router?.pathname?.endsWith("/profile")) ||
    Boolean(router?.pathname?.includes("/profile"));

  const isExcludedRoute =
    router?.pathname === routes.checkout ||
    router?.pathname === routes.paymentStatus ||
    router?.pathname === routes.login ||
    isProfileRoute;

  const showFloatingThemeToggle =
    hasThemeProvider &&
    (router?.pathname === routes.checkout ||
      router?.pathname === routes.paymentStatus ||
      router?.pathname === routes.login);

  if (isExcludedRoute) {
    return (
      <main className="bg-background text-foreground flex min-h-screen flex-col">
        {showFloatingThemeToggle && (
          <div className="fixed top-4 right-4 z-50 rounded-md border border-border bg-card p-1 shadow-sm">
            <ThemeToggle />
          </div>
        )}
        {children}
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground flex flex-col min-h-screen">
      <Navbar />
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 pt-20"
        exit={{ opacity: 0, scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
      <Footer />
    </main>
  );
};

export default PageLayout;
