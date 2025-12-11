import type { LinkButtonProps } from '@tbe/interface';
import { useState } from 'react';

import { Button, Link } from '../..';

const LinkButton = ({
  href,
  className = '',
  buttonProps,
  target,
  active = true,
}: LinkButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    // Show loading spinner when navigating
    if (active) {
      setIsLoading(true);
    }
  };

  return (
    <Link active={active} className={className} href={href} target={target} onClick={handleClick}>
      <Button {...buttonProps} isLoading={isLoading} />
    </Link>
  );
};

export default LinkButton;
