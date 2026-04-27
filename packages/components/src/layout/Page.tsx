import { FlexContainer, Footer, Navbar } from "@tbe/components";
import { envConfig } from "@tbe/constants";
import { useThemeProvider } from "@tbe/hooks";
import type { PageLayoutProps } from "@tbe/interface";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PageLayout = ({ children }: PageLayoutProps) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isMounted } = useThemeProvider();

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
    <FlexContainer
      as="main"
      className={`bg-background text-foreground transition-colors duration-300 flex flex-col min-h-screen ${
        !isMounted ? "invisible" : ""
      }`}
    >
      <Navbar />
      <div className="flex-1 pt-20">{children}</div>
      <Footer />
    </FlexContainer>
  );
};

export default PageLayout;
