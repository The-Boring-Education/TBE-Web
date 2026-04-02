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
  const isDark = theme === "dark";
  return (
    <section
      className={`w-full py-16 px-4 md:px-10 ${
        isDark
          ? "bg-gradient-to-b from-[#0A0A0A] to-[#111]"
          : "bg-gradient-to-b from-white to-[#f0faff]"
      }`}
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2
          className={`text-3xl md:text-4xl font-extrabold mb-4 ${
            isDark ? "text-white" : "text-primary"
          }`}
        >
          {heading}
        </h2>
        {subtext ? (
          <p className={`mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {subtext}
          </p>
        ) : (
          <div className="mb-10" />
        )}

        <AccordionList
          items={faqs.map((faq) => ({
            trigger: faq.question,
            content: faq.answer,
          }))}
          type="single"
          itemClassName={
            isDark
              ? "border border-gray-800 rounded-xl overflow-hidden shadow-sm bg-[#111]"
              : "border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
          }
          triggerClassName={
            isDark
              ? "w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none"
              : "w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none"
          }
          triggerTextClassName={
            isDark
              ? "font-medium text-lg text-gray-200"
              : "font-medium text-lg text-gray-800"
          }
          contentClassName={
            isDark
              ? "px-5 pb-2 text-gray-400 text-sm"
              : "px-5 pb-2 text-gray-700 text-sm"
          }
        />
      </div>
    </section>
  );
};

export default FAQSection;
