import { LoadingSpinner } from '@/components';
import { ButtonProps } from '@/interfaces';

const Button = ({
  variant,
  className = '',
  text,
  active = true,
  isLoading = false,
  onClick,
}: ButtonProps) => {
  let baseClasses = 'button bg-light px-2 py-1 text-white';
  if (variant === 'PRIMARY')
    baseClasses =
      'button bg-primary px-2 py-1 shadow-lg text-white border-2 border-primary hover:scale-105 transition-all';
  // Add Secondary variant
  else if (variant === 'SECONDARY') {
    baseClasses =
      'button bg-secondary px-2 py-1 shadow-lg text-white border-2 border-secondary hover:scale-105 transition-all';
  } else if (variant === 'OUTLINE')
    baseClasses =
      'button bg-light-bg border-2 shadow-lg border-primary px-2 py-1 text-primary hover:scale-105 transition-all';
  else if (variant === 'GHOST')
    baseClasses =
      'button bg-accent px-2 py-1 text-contentLight border-2 hover:border-black transition-all';
  else if (variant === 'SUCCESS')
    baseClasses =
      'button bg-success px-2 py-1 text-white border-2 border-success hover:scale-105 transition-all';
  if (!active) baseClasses = 'button bg-greyDark text-contentLight px-2 py-1';

  const loadingContainer = isLoading && (
    <LoadingSpinner height={3} width={3} borderColour='white' />
  );

  return (
    <button
      className={`${baseClasses} ${className} shadow-md flex items-center justify-center gap-2`}
      disabled={!active || isLoading}
      onClick={onClick}
    >
      {loadingContainer}
      {text}
    </button>
  );
};

export default Button;
