import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { FAQItem } from '../../../layout/SEO';

interface FAQSectionProps {
    faqs: FAQItem[];
    heading: string;
    subtext?: string;
}

const FAQSection = ({ faqs, heading, subtext }: FAQSectionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(index === openIndex ? null : index);
    };

    return (
        <section className='w-full bg-gradient-to-b from-white to-[#f0faff] py-16 px-4 md:px-10'>
            <div className='max-w-5xl mx-auto text-center'>
                <h2 className='text-3xl md:text-4xl font-extrabold text-primary mb-4'>
                    {heading}
                </h2>
                {subtext ? (
                    <p className='text-gray-600 mb-10'>{subtext}</p>
                ) : (
                    <div className='mb-10' />
                )}

                <div className='space-y-2 text-left'>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className='border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white'
                        >
                            <button
                                className='w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none'
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className='font-medium text-lg text-gray-800'>
                                    {faq.question}
                                </span>
                                <motion.span
                                    animate={{
                                        rotate: openIndex === index ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDownIcon className='w-5 h-5 text-gray-500' />
                                </motion.span>
                            </button>
                            {openIndex === index && (
                                <motion.div
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className='px-5 pb-2 text-gray-700 text-sm'
                                    exit={{ opacity: 0, height: 0 }}
                                    initial={{ opacity: 0, height: 0 }}
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
