"use client";

import { CopyButton } from "@tbe/components";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import { useCopyLink } from "@tbe/hooks";
import { trackEvent } from "@tbe/utils";
import { useCallback, useState } from "react";

type Props = {
  pageUrl: string;
  title: string;
};

export function ShareButton({ pageUrl, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { copied, copyLink } = useCopyLink({
    onCopySuccess: () => {
      trackEvent(ANALYTICS_EVENTS.SHARE_RESOURCE, {
        method: "copy_link",
        resource_url: pageUrl,
        resource_title: title,
      });
    },
  });

  const handleCopyLink = useCallback(() => {
    void copyLink(pageUrl);
  }, [copyLink, pageUrl]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(`${title}\n\n${pageUrl}`);
    window.open(
      `https://x.com/intent/tweet?text=${text}`,
      "_blank",
      "width=600,height=400",
    );
    trackEvent(ANALYTICS_EVENTS.SHARE_RESOURCE, {
      method: "twitter",
      resource_url: pageUrl,
      resource_title: title,
    });
  }, [pageUrl, title]);

  const shareToLinkedIn = useCallback(() => {
    const url = encodeURIComponent(pageUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "width=600,height=400",
    );
    trackEvent(ANALYTICS_EVENTS.SHARE_RESOURCE, {
      method: "linkedin",
      resource_url: pageUrl,
      resource_title: title,
    });
  }, [pageUrl, title]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${title}\n\n${pageUrl}`);
    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "width=600,height=400",
    );
    trackEvent(ANALYTICS_EVENTS.SHARE_RESOURCE, {
      method: "whatsapp",
      resource_url: pageUrl,
      resource_title: title,
    });
  }, [pageUrl, title]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl });
        trackEvent(ANALYTICS_EVENTS.SHARE_RESOURCE, {
          method: "native",
          resource_url: pageUrl,
          resource_title: title,
        });
      } catch {
        // User cancelled share
      }
    }
  }, [pageUrl, title]);

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-1 sm:gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        aria-label="Share this resource"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
            <CopyButton />
            <button
              type="button"
              onClick={() => {
                shareToTwitter();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
            <button
              type="button"
              onClick={() => {
                shareToLinkedIn();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </button>
            <button
              type="button"
              onClick={() => {
                shareToWhatsApp();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
            {typeof navigator !== "undefined" &&
              typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={() => {
                    shareNative();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 border-t border-zinc-800 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  More options…
                </button>
              )}
          </div>
        </>
      )}
    </div>
  );
}
