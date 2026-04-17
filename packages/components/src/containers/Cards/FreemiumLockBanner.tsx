import { FaLock } from "react-icons/fa";

import Text from "../../common/Typography/Text";

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
    <div className="w-full bg-orange-950/40 border-b border-orange-900/50 px-4 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <FaLock className="text-orange-400 text-xs" />
        <Text level="p" className="text-orange-300 text-[11px] font-medium">
          {message ?? defaultMessage}
        </Text>
      </div>
      <button
        onClick={onUpgradeClick}
        className="text-[11px] font-bold text-orange-300 hover:text-orange-200 underline underline-offset-2 transition-colors"
      >
        {ctaLabel}
      </button>
    </div>
  );
};

export default FreemiumLockBanner;
