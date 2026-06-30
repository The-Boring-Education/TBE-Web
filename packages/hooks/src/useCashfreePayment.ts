import { getCashfreeMode } from "@tbe/constants";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    Cashfree: any;
    CFPaymentSDK?: any;
  }
}

const CASHFREE_SCRIPT_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

const useCashfreePayment = () => {
  const [isCashfreeLoaded, setIsCashfreeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCashfreeSDK = useCallback(() => {
    const script = document.createElement("script");
    script.src = CASHFREE_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (window.Cashfree || window.CFPaymentSDK) {
        setIsCashfreeLoaded(true);
      } else {
        setError(
          "Payment gateway initialization failed. Please refresh the page.",
        );
      }
    };

    script.onerror = () => {
      setError("Failed to load payment gateway. Please try again.");
      setIsCashfreeLoaded(false);
    };

    document.body.appendChild(script);
  }, []);

  const cleanupCashfreeSDK = () => {
    const script = document.querySelector(
      `script[src="${CASHFREE_SCRIPT_URL}"]`,
    );
    if (script) {
      document.body.removeChild(script);
    }
  };

  useEffect(() => {
    if (!window.Cashfree && !window.CFPaymentSDK) {
      loadCashfreeSDK();
    } else {
      setIsCashfreeLoaded(true);
    }

    return cleanupCashfreeSDK;
  }, [loadCashfreeSDK]);

  /**
   * @param returnUrlAfterPayment - **Absolute** URL Cashfree redirects to after payment
   * (`redirectTarget: "_self"`). Defaults to `window.location.href`. Use your app’s
   * `/payment/status?order_id=...&next=...` here — if this is the checkout page, a full
   * redirect reloads the app and `onSuccess` may never run.
   */
  const launchPayment = async (
    paymentSessionId: string,
    onSuccess?: (data: any) => void,
    onFailure?: (data: any) => void,
    onClose?: () => void,
    returnUrlAfterPayment?: string,
  ) => {
    const PaymentSDK = window.Cashfree || window.CFPaymentSDK;
    if (!PaymentSDK) {
      throw new Error(
        "Payment gateway is not available. Please refresh the page and try again.",
      );
    }

    let mode = "sandbox";
    if (getCashfreeMode() === "production") {
      mode = "production";
    }

    const cashfree = new PaymentSDK({
      mode,
    });

    const returnUrl = returnUrlAfterPayment ?? window.location.href;

    await cashfree.checkout({
      paymentSessionId,
      returnUrl,
      redirectTarget: "_self",
      onSuccess,
      onFailure,
      onClose,
    });
  };

  return {
    isCashfreeLoaded,
    error,
    launchPayment,
  };
};

export default useCashfreePayment;
