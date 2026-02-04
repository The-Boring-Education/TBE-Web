import type { LinkButtonProps } from '@tbe/interface';

import { Button, Link } from '../..';

const LinkButton = ({
  href,
  className = '',
  buttonProps,
  target,
  active = true,
  theme,
  noLoader = false,
}: LinkButtonProps) => {
  const isDark = theme === 'dark';
  // Merge theme-based className with existing buttonProps className
  const themedButtonProps = {
    ...buttonProps,
    className: `${buttonProps.className || ''} ${isDark ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : ''}`.trim(),
  };

  return (
    <Link active={active} className={className} href={href} target={target}>
      <Button {...themedButtonProps} isLoading={false} />
    </Link>
  );
};

export default LinkButton;