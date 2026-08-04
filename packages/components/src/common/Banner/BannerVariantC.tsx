import { SectionHeaderContainer, Text } from "@tbe/components";
import type { BannerProps } from "@tbe/interface";
import { ExternalLink } from "lucide-react";

const BannerVariantC = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
}: BannerProps) => (
  <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 select-none">
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
      {imageSrc ? (
        <div className="md:col-span-4 flex justify-center">
          <img
            alt="Campus Ambassador"
            src={imageSrc}
            className="h-28 sm:h-36 w-auto object-contain"
          />
        </div>
      ) : null}

      <div
        className={`${imageSrc ? "md:col-span-8" : "md:col-span-12"} space-y-3 text-center md:text-left`}
      >
        <SectionHeaderContainer
          heading={title}
          focusText=""
          headingLevel={3}
          textCenter={false}
        />

        <Text className="paragraph text-grey max-w-2xl" level="p">
          {description}
        </Text>

        <div className="pt-2">
          <a
            href={buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF5757] px-5 py-2.5 text-xs font-bold sm:text-sm text-white transition-colors duration-200 hover:bg-[#e04343]"
          >
            {buttonText} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default BannerVariantC;
