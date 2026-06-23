import { FaLock } from "react-icons/fa";

export interface DsaUpsellModalProps {
  /** Controls visibility. */
  open: boolean;
  /** Called when the user chooses to view pricing. */
  onViewPlans: () => void;
  /** Called when the user dismisses the modal. */
  onDismiss: () => void;
  /** Optional heading override. Defaults to "Unlock DSA Yatra". */
  title?: string;
  /** Optional body copy override. */
  description?: string;
  /** Optional primary CTA label override. */
  ctaLabel?: string;
  /** Optional dismiss button label. Defaults to "Continue with free questions". */
  dismissLabel?: string;
}

/**
 * Shared payment-upsell modal shown when a freemium user clicks a locked DSA
 * question. Used by both DSA Yatra `sheets.tsx` and OnCampus DSA prep.
 *
 * Accessibility: renders as a `role="dialog"` with `aria-modal="true"`.
 */
const DsaUpsellModal = ({
  open,
  onViewPlans,
  onDismiss,
  title = "Unlock DSA Yatra",
  description = "Subscribe to access all questions, solutions, and study guides. One plan, lifetime access.",
  ctaLabel = "View Plans — Subscribe Now",
  dismissLabel = "Continue with free questions",
}: DsaUpsellModalProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dsa-upsell-title"
      aria-describedby="dsa-upsell-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md relative">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
              <FaLock className="text-red-400 text-xl" />
            </div>
            <div>
              <h3
                id="dsa-upsell-title"
                className="text-white font-bold mb-1.5 tracking-tight text-lg"
              >
                {title}
              </h3>
              <p
                id="dsa-upsell-desc"
                className="text-gray-400 text-sm leading-relaxed"
              >
                {description}
              </p>
            </div>
            <button
              onClick={onViewPlans}
              className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_20px_rgba(220,38,38,0.35)]"
            >
              {ctaLabel}
            </button>
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors"
            >
              {dismissLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaUpsellModal;
