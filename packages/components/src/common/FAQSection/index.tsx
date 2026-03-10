import type { FAQItem } from '../../layout/SEO';
import AccordionList from '../Accordion/AccordionList';

interface FAQSectionProps {
    faqs: FAQItem[];
    heading: string;
    subtext?: string;
}

const FAQSection = ({ faqs, heading, subtext }: FAQSectionProps) => (
    <section className="w-full bg-gradient-to-b from-white to-[#f0faff] py-16 px-4 md:px-10">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
                {heading}
            </h2>
            {subtext ? (
                <p className="text-gray-600 mb-10">{subtext}</p>
            ) : (
                <div className="mb-10" />
            )}

            <AccordionList
                items={faqs.map((faq) => ({
                    trigger: faq.question,
                    content: faq.answer,
                }))}
                type="single"
            />
        </div>
    </section>
);

export default FAQSection;
