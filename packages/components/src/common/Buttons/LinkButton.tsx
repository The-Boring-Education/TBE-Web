import type { LinkButtonProps } from '@tbe/interface';
import { useEffect, useState } from 'react';

import { Button, Link } from '../..';

const LinkButton = ({
  href,
  className = '',
  buttonProps,
  target,
  active = true,
  theme,
}: LinkButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === 'dark';

  const handleClick = () => {
    // Show loading spinner when navigating
    if (active) {
      setIsLoading(true);
    }
  };

  // Reset loading state when href changes (in case navigation is cancelled or same-page navigation)
  useEffect(() => {
    setIsLoading(false);
  }, [href]);

  // Merge theme-based className with existing buttonProps className
  const themedButtonProps = {
    ...buttonProps,
    className: `${buttonProps.className || ''} ${isDark ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : ''}`.trim(),
  };

  return (
    <Link active={active} className={className} href={href} target={target} onClick={handleClick}>
      <Button {...themedButtonProps} isLoading={isLoading} />
    </Link>
  );
};

export default LinkButton;
