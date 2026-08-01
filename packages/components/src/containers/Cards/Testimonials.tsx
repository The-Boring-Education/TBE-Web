import {
  Section,
  SectionHeaderContainer,
  TestimonialCard,
} from "@tbe/components";
import { TESTIMONIALS } from "@tbe/constants";

const Testimonials = () => {
  const firstRows = TESTIMONIALS.slice(0, 6);
  const lastRow = TESTIMONIALS.slice(6);

  return (
    <Section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 select-none">
      <div className="space-y-6">
        <SectionHeaderContainer
          heading="Hear the words of"
          focusText="Ex-Learners"
          headingLevel={3}
          textCenter
        />

        {/* First 6 cards — 1 col mobile, 2 col sm, 3 col lg */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {firstRows.map((item) => (
            <TestimonialCard {...item} key={item.id} />
          ))}
        </div>

        {/* Last row — full width on mobile, centered on desktop */}
        {lastRow.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:flex lg:justify-center lg:gap-6">
            {lastRow.map((item) => (
              <div
                key={item.id}
                className="w-full lg:w-[calc(33.333%-12px)] lg:max-w-sm"
              >
                <TestimonialCard {...item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

export default Testimonials;
