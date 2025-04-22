import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: 'What is Bring Your Idea Cohort?',
    answer:
      'It’s a 2-phase mentorship-driven program where you launch a product in the first phase and prepare for interviews in the second.',
  },
  {
    question: 'Do I need to have a tech background to join?',
    answer:
      'Not necessarily. We’ve different tracks for beginners, confused learners, and those looking for mentorship.',
  },
  {
    question: 'Can I join with a friend or a team?',
    answer:
      'Yes, you can join with up to 4 friends and build together. The pricing adjusts automatically per team size.',
  },
  {
    question: 'What if I don’t complete the project?',
    answer:
      'You still learn a lot! However, the 50% cashback is only applicable on project completion.',
  },
  {
    question: 'Are 1:1 sessions included?',
    answer:
      'Yes! You get weekly 1:1 mentorship along with product roundtables.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className='w-full bg-gradient-to-b from-white to-[#f0faff] py-16 px-4 md:px-10'>
      <div className='max-w-5xl mx-auto text-center'>
        <h2 className='text-3xl md:text-4xl font-extrabold text-primary mb-4'>
          Frequently Asked Questions
        </h2>
        <p className='text-gray-600 mb-10'>
          Here’s everything you might want to ask before joining the Bring Your
          Idea Cohort
        </p>

        <div className='space-y-2 text-left'>
          {FAQ_LIST.map((faq, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white'
            >
              <button
                onClick={() => toggleFAQ(index)}
                className='w-full flex justify-between items-center px-5 py-2 text-left focus:outline-none'
              >
                <span className='font-medium text-lg text-gray-800'>
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className='w-5 h-5 text-gray-500' />
                </motion.span>
              </button>
              {openIndex === index && (
                <motion.div
                  className='px-5 pb-2 text-gray-700 text-sm'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
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
