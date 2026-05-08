import { FaLock } from "react-icons/fa";

import Button from "../../common/Buttons/Button";
import Text from "../../common/Typography/Text";
import FlexContainer from "../Page/common/FlexContainer";

export interface FreemiumLockBannerProps {
  /** Number of questions the free user can currently access. */
  unlockedCount: number;
  /** Called when the user clicks the "View Plans" CTA. */
  onUpgradeClick: () => void;
  /** Optional copy override for the upgrade button. */
  ctaLabel?: string;
  /** Optional copy override for the banner message. */
  message?: string;
}

/**
 * Slim banner shown at the top of a DSA workspace when the API has marked
 * some questions as locked (freemium gating). Shared by DSA Yatra + OnCampus.
 */
const FreemiumLockBanner = ({
  unlockedCount,
  onUpgradeClick,
  ctaLabel = "View Plans",
  message,
}: FreemiumLockBannerProps) => {
  const defaultMessage = `Freemium preview — ${unlockedCount} questions unlocked. Subscribe to access all.`;

  return (
    <FlexContainer
      fullWidth
      justifyCenter={false}
      wrap={false}
      className="shrink-0 justify-start gap-3 bg-orange-950/40 border-b border-orange-900/50 px-4 py-2.5"
    >
      <FlexContainer
        justifyCenter={false}
        wrap={false}
        className="min-w-0 gap-2"
      >
        <FaLock className="shrink-0 text-orange-400 text-xs" />
        <Text level="p" className="text-orange-300 text-sm">
          {message ?? defaultMessage}
        </Text>
      </FlexContainer>
      <Button
        variant="GHOST"
        size="SMALL"
        text={ctaLabel}
        onClick={onUpgradeClick}
      />
    </FlexContainer>
  );
};

export default FreemiumLockBanner;
