import { motion } from 'framer-motion';

import { LoadingSpinner } from '@/components';

import type { ButtonProps } from '@/interfaces';

const getButtonClasses = (
  baseClasses: string,
  variant: string,
  active: boolean
) => {
  if (!active) {
    return `${baseClasses} bg-greyLight text-greyDark px-2 py-1`;
  }

  const variantClasses: Record<string, string> = {
    PRIMARY:
      'bg-primary shadow-lg text-white border-2 border-primary hover:scale-105 transition-all',
    SECONDARY:
      'bg-secondary shadow-lg text-white border-2 border-secondary hover:scale-105 transition-all',
    OUTLINE:
      'bg-light-bg border-2 shadow-lg border-primary text-primary hover:scale-105 transition-all',
    GHOST:
      'bg-accent text-contentLight border-2 hover:border-black transition-all',
    SUCCESS:
      'bg-success text-white border-2 border-success hover:scale-105 transition-all',
  };

  return `${baseClasses} ${variantClasses[variant] || ''}`;
};

const Button = ({
  variant,
  className = '',
  text,
  active = true,
  isLoading = false,
  onClick,
  animationClasses = '',
  icon,
  isFullWidth = false,
}: ButtonProps) => {
  let baseClasses = 'button px-2 py-1';
  baseClasses = getButtonClasses(baseClasses, variant, active);

  const loadingContainer = isLoading && (
    <LoadingSpinner borderColour='white' height={3} width={3} />
  );

  return (
    <motion.div
      className={`${animationClasses} ${isFullWidth ? 'w-full' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        className={`${baseClasses} ${className} shadow-md flex items-center justify-center gap-2`}
        disabled={!active || isLoading}
        onClick={onClick}
      >
        {loadingContainer}
        {text}
        {icon && <span>{icon}</span>}
      </button>
    </motion.div>
  );
};

export default Button;
