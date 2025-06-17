import { motion } from 'framer-motion';

import { Section } from '@/components';
import type { CohortJourneySectionProps } from '@/interfaces';

const CohortJourneyContainer = ({ weeks }: CohortJourneySectionProps) => (
  <Section className='bg-white'>
    <ol className='relative border-l border-gray-300 ml-2 space-y-8'>
      {weeks.map((item, index) => (
        <motion.li
          key={index}
          className='mb-8 ml-4'
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className='absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-white' />
          <time className='mb-1 text-sm font-medium text-primary'>
            {item.week}
          </time>
          <h3 className='text-lg font-semibold text-gray-900'>{item.title}</h3>
          <p className='text-gray-600'>{item.description}</p>
        </motion.li>
      ))}
    </ol>
  </Section>
);

export default CohortJourneyContainer;
