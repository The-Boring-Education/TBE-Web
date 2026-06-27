import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import {
  FlexContainer,
  Image,
  Section,
  SectionHeaderContainer,
  Text,
} from "@tbe/components";
import type { LandingPageHeroProps } from "@tbe/interface";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "tbe-hero-theme";

const LandingPageHero = ({
  sectionHeaderProps,
  primaryButton,
  secondaryButton,
  backgroundImageUrl,
  heroText,
  theme: themeProp = "light",
  showThemeToggle = false,
}: LandingPageHeroProps) => {
  const { heading, focusText } = sectionHeaderProps;
  const [theme, setTheme] = useState<"light" | "dark">(themeProp);

  useEffect(() => {
    if (!showThemeToggle) return;
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as
      | "light"
      | "dark"
      | null;
    if (saved) setTheme(saved);
  }, [showThemeToggle]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  const isDark = theme === "dark";

  return (
    <Section className={isDark ? "bg-[#0A0A0A]" : ""}>
      <FlexContainer className="py-2 sm:py-6" direction="col" justifyCenter>
        {showThemeToggle && (
          <FlexContainer className="w-full justify-end mb-2">
            <button
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isDark
                  ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? (
                <>
                  <SunIcon className="h-4 w-4" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-4 w-4" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </FlexContainer>
        )}
        <FlexContainer
          className="wrap-reverse flex-col-reverse gap-6 lg:flex-row"
          itemCenter
          justifyCenter
          wrap={false}
        >
          <FlexContainer
            className="items-center lg:items-start lg:justify-start"
            direction="col"
            itemCenter={false}
            justifyCenter={false}
          >
            <FlexContainer
              direction="col"
              itemCenter={false}
              className="items-center lg:items-start"
            >
              <SectionHeaderContainer
                focusText={focusText}
                heading={heading}
                headingLevel={3}
                theme={theme}
                textCenter={false}
                className="items-center lg:items-start text-center lg:text-left"
              />
              <Text
                className={`paragraph mt-1 w-full text-center lg:text-left ${
                  isDark ? "text-gray-300" : "text-grey"
                }`}
                level="p"
              >
                {heroText}
              </Text>
            </FlexContainer>
            <FlexContainer className="mt-4 w-full justify-center gap-2 lg:justify-start">
              {primaryButton}
              {secondaryButton}
            </FlexContainer>
          </FlexContainer>
          <Image
            alt="landing-page-hero-image"
            className="w-80 md:w-96 lg:w-[450px]"
            fullWidth={false}
            loading="lazy"
            src={backgroundImageUrl}
          />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default LandingPageHero;
