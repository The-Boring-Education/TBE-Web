import type { LinkButtonProps } from '@/interfaces';

import { Button, Link } from '../..';

const LinkButton = ({
  href,
  className = '',
  buttonProps,
  target,
  active = true,
}: LinkButtonProps) => (
    <Link active={active} className={className} href={href} target={target}>
      <Button {...buttonProps} />
    </Link>
  );

export default LinkButton;
