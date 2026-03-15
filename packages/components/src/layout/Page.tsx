import { Footer, Navbar } from "@tbe/components";
import { envConfig } from "@tbe/constants";
import type { PageLayoutProps } from "@tbe/interface";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PageLayout = ({ children }: PageLayoutProps) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleRouteChange = (url: string) => {
      window.scrollTo(0, 0);

      if (typeof window.gtag !== "undefined") {
        window.gtag("config", envConfig.GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Clean up the event listener when the component unmounts
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [isClient, router.events]);

  return (
    <main className="bg-lightBG flex flex-col min-h-screen">
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
