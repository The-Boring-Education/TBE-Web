import {
  FlexContainer,
  Image,
  Section,
  SectionHeaderContainer,
  Text,
} from "@tbe/components";
import type { LandingPageHeroProps } from "@tbe/interface";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const LandingPageHero = ({
  sectionHeaderProps,
  primaryButton,
  secondaryButton,
  backgroundImageUrl,
  heroText,
  theme = "light",
  eyebrow,
}: LandingPageHeroProps) => {
  const { heading, focusText } = sectionHeaderProps;
  const isDark = theme === "dark";

  return (
    <Section
      className={`relative ${isDark ? "bg-[#0A0A0A] overflow-hidden" : "bg-transparent"}`}
    >
      {/* Decorative background — only active in dark mode to prevent double gradient seams in light mode */}
      {isDark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-primary/20"
            animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full blur-3xl bg-primary/10"
            animate={{ y: [0, -20, 0], x: [0, -12, 0] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]"
          />
        </div>
      )}

      <FlexContainer
        className="relative z-10 py-8 sm:py-12 lg:py-16"
        direction="col"
        justifyCenter
      >
        <FlexContainer
          className="wrap-reverse flex-col-reverse gap-8 lg:flex-row lg:gap-12"
          itemCenter
          justifyCenter
          wrap={false}
        >
          <motion.div
            className="flex w-full max-w-2xl flex-col items-center lg:items-start lg:justify-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <FlexContainer
              direction="col"
              itemCenter={false}
              className="items-center lg:items-start"
            >
              {eyebrow && (
                <motion.span
                  variants={itemVariants}
                  className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white/80"
                      : "border-primary/20 bg-primary/5 text-primary"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDark ? "bg-primary" : "bg-primary"
                    }`}
                  />
                  {eyebrow}
                </motion.span>
              )}
              <motion.div variants={itemVariants} className="w-full">
                <SectionHeaderContainer
                  focusText={focusText}
                  heading={heading}
                  headingLevel={3}
                  theme={theme}
                  textCenter={false}
                  className="items-center lg:items-start text-center lg:text-left"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Text
                  className={`paragraph mt-3 w-full max-w-xl text-center lg:text-left ${
                    isDark ? "text-gray-300" : "text-grey"
                  }`}
                  level="p"
                >
                  {heroText}
                </Text>
              </motion.div>
            </FlexContainer>
            <motion.div
              variants={itemVariants}
              className="mt-6 flex w-full flex-wrap justify-center gap-3 lg:justify-start"
            >
              {primaryButton}
              {secondaryButton}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Soft glow behind hero image */}
            <div
              aria-hidden
              className={`absolute inset-0 -z-0 mx-auto my-auto h-64 w-64 rounded-full blur-3xl md:h-80 md:w-80 ${
                isDark ? "bg-primary/20" : "bg-primary/15"
              }`}
            />
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                alt="landing-page-hero-image"
                className="w-72 drop-shadow-xl sm:w-80 md:w-96 lg:w-[450px]"
                fullWidth={false}
                loading="lazy"
                src={backgroundImageUrl}
              />
            </motion.div>
          </motion.div>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default LandingPageHero;
