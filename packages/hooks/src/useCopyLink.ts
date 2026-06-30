import { useCallback, useEffect, useState } from "react";

export interface UseCopyLinkOptions {
  resetAfterMs?: number;
  onCopySuccess?: () => void;
  onCopyError?: (error: unknown) => void;
}

export interface UseCopyLinkReturn {
  copied: boolean;
  copyLink: (url?: string) => Promise<boolean>;
}

const fallbackCopyText = (value: string): boolean => {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const didCopy = document.execCommand("copy");
  document.body.removeChild(textarea);

  return didCopy;
};

const useCopyLink = ({
  resetAfterMs = 2000,
  onCopySuccess,
  onCopyError,
}: UseCopyLinkOptions = {}): UseCopyLinkReturn => {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(
    async (url?: string) => {
      const value =
        url || (typeof window !== "undefined" ? window.location.href : "");
      if (!value) return false;

      try {
        const hasClipboardApi =
          typeof navigator !== "undefined" &&
          typeof navigator.clipboard?.writeText === "function";

        if (hasClipboardApi) {
          await navigator.clipboard.writeText(value);
        } else if (!fallbackCopyText(value)) {
          return false;
        }

        setCopied(true);
        onCopySuccess?.();
        return true;
      } catch (error) {
        onCopyError?.(error);
        return false;
      }
    },
    [onCopyError, onCopySuccess],
  );

  useEffect(() => {
    if (!copied || typeof window === "undefined") return;

    const timerId = window.setTimeout(() => setCopied(false), resetAfterMs);
    return () => window.clearTimeout(timerId);
  }, [copied, resetAfterMs]);

  return { copied, copyLink };
};

export default useCopyLink;
