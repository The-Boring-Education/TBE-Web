import { TextProps } from '@/interfaces';

const Text = ({ level, children, className = '', textCenter }: TextProps) => {
  const HeadingTag = level;
  return (
    <HeadingTag className={className + ` ${textCenter ? 'text-center' : ''}`}>
      {children}
    </HeadingTag>
  );
};

export default Text;
