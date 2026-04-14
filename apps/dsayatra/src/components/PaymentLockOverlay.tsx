import { Button } from "@tbe/components";
import { routes } from "@tbe/constants";
import { useRouter } from "next/router";
import { useState } from "react";

interface PaymentLockOverlayProps {
  /** Set to true to show the overlay; pass the `isLocked` value from `usePaymentStatus` */
  isLocked: boolean;
  /** Set to true while payment status is still being checked */
  isLoading?: boolean;
}

export const PaymentLockOverlay = ({
  isLocked,
  isLoading,
}: PaymentLockOverlayProps) => {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Not locked or user dismissed the overlay
  if (!isLocked || dismissed) return null;

  // Don't block UI during initial loading check — let the page render normally
  if (isLoading) return null;

  const handleSubscribe = () => {
    void router.push(routes.dsayatra.pricing);
  };

  return (
    <>
      {/* Backdrop — fixed full-screen overlay with blur */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Lock card */}
        <div
          className="relative w-full max-w-md mx-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 text-center shadow-2xl"
          style={{
            boxShadow:
              "0 0 60px rgba(255,87,87,0.2), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Red accent bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#ff5757] rounded-b-full" />

          {/* Logo / icon */}
          <div className="w-16 h-16 bg-[#ff5757]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-[#ff5757]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Unlock DSA Yatra
          </h2>
          <p className="text-[#a0a0a0] text-sm leading-relaxed mb-6">
            Subscribe to access your personalized DSA dashboard, topic-wise
            sheets, revision tracking, and more.
          </p>

          <Button
            text="Subscribe Now"
            variant="PRIMARY"
            onClick={handleSubscribe}
            className="w-full"
          />

          <button
            onClick={() => {
              void router.push("/");
            }}
            className="mt-4 text-[#606060] hover:text-[#a0a0a0] text-xs transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
};
