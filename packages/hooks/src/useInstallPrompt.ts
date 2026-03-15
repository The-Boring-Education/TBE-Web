import { useEffect, useState } from "react";

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Hide if already installed (standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    // Check if the event was already cached on window
    if ((window as any).deferredBeforeInstallPrompt) {
      setDeferredPrompt((window as any).deferredBeforeInstallPrompt);
      setIsInstallable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Cache the event globally
      (window as any).deferredBeforeInstallPrompt = e;
    };

    const onAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      // Clear the cached event
      delete (window as any).deferredBeforeInstallPrompt;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return { isInstallable, deferredPrompt };
}
