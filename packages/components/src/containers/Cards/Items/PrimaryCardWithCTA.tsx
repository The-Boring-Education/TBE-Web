import { GradientContainer, Image, LinkButton, Text } from "@tbe/components";
import type { PrimaryCardWithCTAProps } from "@tbe/interface";

const PrimaryCardWithCTA = ({
  image,
  imageAltText,
  title,
  href,
  content,
  active,
  ctaText,
  borderColour = 4,
  target,
  launchingOn,
  isPremium,
  isPurchased,
  theme = "light",
}: PrimaryCardWithCTAProps) => {
  const border = `border-borderColor${borderColour}`;
  const isDark = theme === "dark";

  const containerClassName = isDark
    ? `md:w-[45%] lg:w-[30%] max-w-md flex-1 cursor-pointer rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-lg hover:border-red-500/30 border-gray-800`
    : `md:w-[45%] lg:w-[30%] max-w-md ${border} flex-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`;

  return (
    <GradientContainer
      childrenClassName="p-2 h-full flex flex-col relative"
      className={containerClassName}
      theme={isDark ? "dark" : "light"}
      backgroundColor={isDark ? "bg-[#0A0A0A]" : undefined}
      suppressHoverScale={isDark}
    >
      {isPurchased ? (
        <div
          className={`absolute top-3 right-3 text-[12px] font-medium px-3 py-[4px] rounded-full border shadow-sm z-10 ${
            isDark
              ? "bg-gray-900/80 text-green-400 border-green-700/50"
              : "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 border-green-300 dark:border-green-700"
          }`}
        >
          ✅ Purchased
        </div>
      ) : isPremium ? (
        <div
          className={`absolute top-3 right-3 text-[12px] font-medium px-3 py-[4px] rounded-full border shadow-sm z-10 ${
            isDark
              ? "bg-gray-900/80 text-amber-400/90 border-amber-700/40"
              : "bg-yellow-100 dark:bg-yellow-900 text-red-600 dark:text-red-300 border-yellow-300 dark:border-yellow-700"
          }`}
        >
          🔒 Premium
        </div>
      ) : null}

      {image && (
        <Image
          alt={imageAltText}
          className="m-auto w-4/5 rounded-t-lg object-cover"
          src={`${image}`}
        />
      )}
      <div className="mt-2">
        <Text
          className={`heading-5 truncate ${isDark ? "text-white" : "text-gray-900"}`}
          level="h5"
        >
          {title}
        </Text>
        <Text
          className={`pre-title mt-1 line-clamp-1 ${isDark ? "text-gray-400" : "text-grey"}`}
          level="p"
        >
          {content}
        </Text>
        {launchingOn && (
          <Text
            className={`pre-title mt-1 s ${isDark ? "text-red-400/90" : "text-primary"}`}
            level="p"
          >
            {launchingOn}
          </Text>
        )}
        <LinkButton
          active={active}
          buttonProps={{
            variant: "PRIMARY",
            text: active && ctaText ? ctaText : "Coming soon",
            active,
            className: `w-full`,
          }}
          className="mt-3 block"
          href={href}
          target={target}
          noLoader
          theme={isDark ? "dark" : "light"}
        />
      </div>
    </GradientContainer>
  );
};

export default PrimaryCardWithCTA;
