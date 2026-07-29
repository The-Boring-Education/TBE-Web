import { SectionHeaderContainer, Text } from "@tbe/components";
import { LINKS } from "@tbe/constants";
import { ExternalLink } from "lucide-react";

const CollegeEventsSection = () => (
  <section className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6 md:py-12 select-none">
    <div className="mx-auto max-w-3xl space-y-3.5">
      <SectionHeaderContainer
        heading="Host TBE at Your"
        focusText="College"
        headingLevel={3}
        textCenter
      />

      <Text className="paragraph text-grey max-w-2xl mx-auto" level="p">
        Bring cutting-edge tech education to your campus! Join our network of
        college partners and host exciting tech events, workshops, and learning
        sessions.
      </Text>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href={LINKS.hostTBEAtYourCollege}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF5757] px-5 py-2.5 text-xs font-bold sm:text-sm text-white transition-colors duration-200 hover:bg-[#e04343]"
        >
          Apply to Host Events <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <a
          href={LINKS.viewSessionDetails}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold sm:text-sm text-zinc-800 transition-colors duration-200 hover:bg-zinc-50"
        >
          View Session Details
        </a>
      </div>
    </div>
  </section>
);

export default CollegeEventsSection;
