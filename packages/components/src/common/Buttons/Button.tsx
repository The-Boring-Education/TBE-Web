import type { ButtonProps } from '@tbe/interface';
import { motion } from 'framer-motion';

import LoadingSpinner from '../LoadingSpinner';

/**
 * Button component with enhanced hover animations
 *
 * @param variant - Button style variant
 * @param className - Additional CSS classes
 * @param text - Button text content
 * @param active - Whether button is active/enabled
 * @param isLoading - Show loading spinner
 * @param onClick - Click handler
 * @param animationClasses - Additional animation classes
 * @param icon - Optional icon element
 * @param isFullWidth - Make button full width
 * @param animationType - Hover animation type:
 *   - 'DEFAULT': Subtle scale and shadow enhancement (default)
 *   - 'BOUNCE': Scale up with slight upward movement
 *   - 'GLOW': Scale with glowing shadow effect
 */
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
      'bg-primary text-white border border-primary/70 transition-colors duration-200 ease-in-out',
    SECONDARY:
      'bg-secondary text-white border border-secondary/70 transition-colors duration-200 ease-in-out',
    OUTLINE:
      'bg-transparent border border-primary text-primary transition-colors duration-200 ease-in-out',
    GHOST:
      'bg-accent text-contentLight border border-black/10 transition-colors duration-200 ease-in-out',
    SUCCESS:
      'bg-success text-white border border-success/70 transition-colors duration-200 ease-in-out',
    NEUTRAL:
      'bg-primary text-black border border-black/10 transition-colors duration-200 ease-in-out',

  };

  return `${baseClasses} ${variantClasses[variant] || ''}`;
};


const animationVariants: any = {
  DEFAULT: {
    scale: 1,
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  HOVER: {
    scale: 1.02,
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  BOUNCE: {
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  BOUNCE_HOVER: {
    scale: 1.05,
    y: -2,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  GLOW: {
    scale: 1,
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  GLOW_HOVER: {
    scale: 1.03,
    boxShadow:
      '0 0 20px rgba(59, 130, 246, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

const Button = ({
  variant,
  className = '',
  text,
  children,
  active = true,
  isLoading = false,
  onClick,
  animationClasses = '',
  icon,
  isFullWidth = false,
  animationType = 'DEFAULT',
  size = 'MEDIUM',
  type = 'button',
}: ButtonProps) => {
  // Size classes mapping
  const sizeClasses = {
    SMALL: 'px-2 py-1 text-xs',
    MEDIUM: 'px-3 py-2 text-sm',
    LARGE: 'px-4 py-3 text-base',
  };

  let baseClasses = `button rounded-1 ${sizeClasses[size]}`;
  baseClasses = getButtonClasses(baseClasses, variant, active);

  // Show loading spinner when isLoading is true
  const loadingContainer = isLoading && (
    <LoadingSpinner borderColour='white' height={3} width={3} />
  );

  // Get animation variant based on type
  const getAnimationVariant = () => {
    switch (animationType) {
      case 'BOUNCE':
        return {
          initial: animationVariants.BOUNCE,
          whileHover: animationVariants.BOUNCE_HOVER,
          whileTap: { scale: 0.98, y: 0 },
        };
      case 'GLOW':
        return {
          initial: animationVariants.GLOW,
          whileHover: animationVariants.GLOW_HOVER,
          whileTap: { scale: 0.97 },
        };
      default:
        return {
          initial: animationVariants.DEFAULT,
          whileHover: animationVariants.HOVER,
          whileTap: { scale: 0.98 },
        };
    }
  };

  // Optimized click handler with immediate feedback
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      // Add immediate visual feedback
      const target = e.currentTarget;
      target.style.transform = 'scale(0.95)';
      target.style.transition = 'transform 0.05s ease-out';

      setTimeout(() => {
        target.style.transform = '';
        target.style.transition = '';
      }, 50);

      onClick(e);
    }
  };

  return (
    <motion.div
      className={`${animationClasses} ${isFullWidth ? 'w-full' : ''}`}
    >
      <motion.button
        className={`${baseClasses} ${className} shadow-md flex items-center justify-center gap-0.5`}
        disabled={!active || isLoading}
        onClick={handleClick}
        type={type}
        {...getAnimationVariant()}
      >
        {loadingContainer}
        {children || text}
        {icon && <span>{icon}</span>}
      </motion.button>
    </motion.div>
  );
};

export default Button;
