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
    // Show immediate loading feedback (hidden from user)
    setIsLoading(true);
    
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 200);
  };

  return (
    <Link active={active} className={className} href={href} target={target} onClick={handleClick}>
      <Button {...buttonProps} isLoading={false} />
    </Link>
  );
};

export default LinkButton;
