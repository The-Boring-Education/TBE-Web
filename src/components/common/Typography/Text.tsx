import { TextProps } from '@/interfaces';

const Text = ({
  level,
  children,
  variant,
  textCenter,
  className = '',
}: TextProps) => {
  const HeadingTag = level;
  let variantClasses = '';

  if (variant === 'SUCCESS') variantClasses = 'text-success';
  else if (variant === 'ERROR') variantClasses = 'text-primary';

  return (
    <HeadingTag
      className={`${className} ${variantClasses} ${
        textCenter ? 'text-center' : ''
      }`}
    >
      {children}
    </HeadingTag>
  );
};

export default Text;
