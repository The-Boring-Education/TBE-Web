import type { LinkProps } from '@tbe/interface';
import Link from 'next/link';

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
