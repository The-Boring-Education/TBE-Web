import type { LinkButtonProps } from "@tbe/interface";
import { buildDelegatedInteractiveAnalyticsDOMProps } from "@tbe/utils";

import { Button, Link } from "../..";

const LinkButton = ({
  href,
  className = "",
  buttonProps,
  target,
  active = true,
  theme,
  noLoader = false,
}: LinkButtonProps) => {
  void noLoader;

  const {
    analyticsId,
    analyticsLabel,
    analyticsSurface,
    suppressGlobalUiClick,
    analyticsMarker,
    ...restButtonProps
  } = buttonProps;

  const isDark = theme === "dark";

  const themedButtonProps = {
    ...restButtonProps,
    className:
      `${restButtonProps.className || ""} ${isDark ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700" : ""}`.trim(),
  };

  const anchorDelegated = buildDelegatedInteractiveAnalyticsDOMProps({
    analyticsId,
    analyticsLabel,
    analyticsSurface,
    suppressGlobalUiClick,
    analyticsMarker,
  });

  return (
    <Link
      {...anchorDelegated}
      active={active}
      className={className}
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      <Button {...themedButtonProps} isLoading={false} suppressGlobalUiClick />
    </Link>
  );
};

export default LinkButton;
