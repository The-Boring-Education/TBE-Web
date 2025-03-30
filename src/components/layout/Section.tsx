import { SectionProps } from '@/interfaces';
import { motion } from 'framer-motion';

const Section = ({
  children,
  className = 'md:px-8 md:py-8 px-2 py-4',
  id = '',
}: SectionProps) => {
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </motion.section>
  );
};

export default Section;
