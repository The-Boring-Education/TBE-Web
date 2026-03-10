import type { LinkProps } from "@tbe/interface";
import Link from "next/link";

const LinkText = ({
  href,
  children,
  className,
  target,
  active = true,
  scroll = false,
  onClick,
}: LinkProps) => {
  // Don't render Link if href is empty, undefined, or just whitespace
  // This prevents Next.js from trying to construct URLs from empty strings during SSR
  if (!href || typeof href !== "string" || href.trim() === "") {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      className={`${className} link ${!active && "disabled"}`}
      href={href}
      scroll={scroll}
      target={target}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default LinkText;
