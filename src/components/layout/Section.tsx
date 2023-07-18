import { SectionProps } from '@/interfaces';
import React from 'react';

const Section = ({
  children,
  className = 'md:px-8 md:py-8 px-4 py-6',
  id = '',
}: SectionProps) => {
  return (
    <section className={className} id={id}>
      {children}
    </section>
  );
};

export default Section;
