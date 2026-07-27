import type { LinkProps } from "@tbe/interface";
import { buildDelegatedInteractiveAnalyticsDOMProps } from "@tbe/utils";
import Link from "next/link";

const LinkText = ({
  href,
  children,
  className,
  target,
  active = true,
  scroll = false,
  onClick,
  analyticsId,
  analyticsLabel,
  analyticsSurface,
  suppressGlobalUiClick,
  analyticsMarker,
}: LinkProps) => {
  const delegated = buildDelegatedInteractiveAnalyticsDOMProps({
    analyticsId,
    analyticsLabel,
    analyticsSurface,
    suppressGlobalUiClick,
    analyticsMarker,
  });

  // Don't render Link if href is empty, undefined, or just whitespace
  // This prevents Next.js from trying to construct URLs from empty strings during SSR
  if (!href || typeof href !== "string" || href.trim() === "") {
    return (
      <span className={className} {...delegated}>
        {children}
      </span>
    );
  }

  return (
    <Link
      className={`${className} link ${!active && "disabled"}`}
      href={href}
      scroll={scroll}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={onClick}
      {...delegated}
    >
      {children}
    </Link>
  );
};

export default LinkText;
