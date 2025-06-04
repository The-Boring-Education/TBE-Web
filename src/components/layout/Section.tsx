import { motion } from 'framer-motion';
import { Fragment } from 'react';

import type { SectionProps } from '@/interfaces';

import { FlexContainer, Text } from '..';

const Section = ({
  children,
  className = 'md:px-8 md:py-8 px-2 py-4',
  id = '',
  isDev = false,
}: SectionProps) => {
  const isDevContainer = isDev && (
    <FlexContainer className='py-1 bg-secondary'>
      <Text className='pre-title' level='span'>
        Currently in Development. Launching Soon
      </Text>
    </FlexContainer>
  );
  return (
    <Fragment>
      {isDevContainer}
      <motion.section
        animate={{ opacity: 1, scale: 1 }}
        className={`${className} ${
          isDev && 'pointer-events-none opacity-50 grayscale'
        }`}
        exit={{ opacity: 0, scale: 0.98 }}
        id={id}
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {children}
      </motion.section>
    </Fragment>
  );
};

export default Section;
