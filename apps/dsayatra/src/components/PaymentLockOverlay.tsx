import { Button } from "@tbe/components";
import { routes } from "@tbe/constants";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

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
  const subscribeRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus the subscribe button when overlay appears
  useEffect(() => {
    if (isLocked && !isLoading) {
      subscribeRef.current?.focus();
    }
  }, [isLocked, isLoading]);

  // Don't block UI during initial loading check — let the page render normally
  if (isLoading || !isLocked) return null;

  const handleSubscribe = () => {
    void router.push(routes.dsayatra.pricing);
  };

  const handleDismiss = () => {
    void router.push("/");
  };

  return (
    <AnimatePresence>
      {/* Backdrop — fixed full-screen overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-overlay-title"
        aria-describedby="lock-overlay-desc"
        style={{
          background: "rgba(0,0,0,0.80)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Lock card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 text-center shadow-2xl"
          style={{
            boxShadow:
              "0 0 80px rgba(255,87,87,0.15), 0 25px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Red accent bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#ff5757] to-[#ff8a80] rounded-b-full" />

          {/* Lock icon with pulse effect */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div
              className="absolute inset-0 bg-[#ff5757]/20 rounded-2xl animate-ping"
              style={{ animationDuration: "2s" }}
            />
            <div className="relative w-16 h-16 bg-[#ff5757]/10 rounded-2xl flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#ff5757]" />
            </div>
          </div>

          <h2
            id="lock-overlay-title"
            className="text-xl font-bold text-white mb-2"
          >
            Unlock DSA Yatra
          </h2>

          <p
            id="lock-overlay-desc"
            className="text-[#a0a0a0] text-sm leading-relaxed mb-6"
          >
            Subscribe to access your personalized DSA dashboard, all questions
            with detailed solutions, revision tracking, and more.
          </p>

          {/* Features preview */}
          <div className="flex items-center justify-center gap-4 mb-6 text-[10px] text-[#808080]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff5757]" />
              400+ Problems
            </span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span>Lifetime Access</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span>All Topics</span>
          </div>

          <Button
            ref={subscribeRef}
            text="Subscribe Now"
            variant="PRIMARY"
            onClick={handleSubscribe}
            className="w-full py-3 font-semibold shadow-lg shadow-[#ff5757]/15"
          />

          <button
            onClick={handleDismiss}
            className="mt-4 text-[#606060] hover:text-[#a0a0a0] text-xs transition-colors"
          >
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
