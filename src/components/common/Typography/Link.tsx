import Link from 'next/link';

import type { LinkProps } from '@/interfaces';

const LinkText = ({
  href,
  children,
  className,
  target,
  active = true,
  scroll = false,
  onClick,
}: LinkProps) => (
  <Link
    className={`${className} link ${!active && 'disabled'}`}
    href={href}
    scroll={scroll}
    target={target}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default LinkText;
