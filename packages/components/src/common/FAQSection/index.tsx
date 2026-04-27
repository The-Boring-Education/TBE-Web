import type { FAQItem } from "../../layout/SEO";
import AccordionList from "../Accordion/AccordionList";

interface FAQSectionProps {
  faqs: FAQItem[];
  heading: string;
  subtext?: string;
  theme?: "light" | "dark";
}

const FAQSection = ({
  faqs,
  heading,
  subtext,
  theme = "light",
}: FAQSectionProps) => {
  return (
    <section className="w-full py-16 px-4 md:px-10 bg-background transition-colors duration-300">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground">
          {heading}
        </h2>
        {subtext ? (
          <p className="mb-10 text-muted-foreground">{subtext}</p>
        ) : (
          <div className="mb-10" />
        )}

        <AccordionList
          items={faqs.map((faq) => ({
            trigger: faq.question,
            content: faq.answer,
          }))}
          type="single"
          itemClassName="border border-border rounded-xl overflow-hidden shadow-sm bg-card"
          triggerClassName="w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none"
          triggerTextClassName="font-medium text-lg text-foreground"
          contentClassName="px-5 pb-2 text-muted-foreground text-sm"
        />
      </div>
    </section>
  );
};

export default FAQSection;
