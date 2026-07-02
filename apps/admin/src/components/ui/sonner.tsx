import { useTheme } from "next-themes";
import { toast as sonnerToast, Toaster as Sonner } from "sonner";

import { logToast } from "@/lib/logInterceptor";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Wrap toast functions to intercept and log
const createWrappedToast = (originalToast: typeof sonnerToast) => {
  const wrappedToast = ((message: string, data?: any) => {
    logToast(
      "info",
      message,
      typeof data === "string" ? data : undefined,
      data,
    );
    return originalToast(message, data);
  }) as typeof sonnerToast;

  wrappedToast.success = (message: string, data?: any) => {
    logToast(
      "success",
      message,
      typeof data === "object" && data?.description
        ? data.description
        : undefined,
      data,
    );
    return originalToast.success(message, data);
  };

  wrappedToast.error = (message: string, data?: any) => {
    logToast(
      "error",
      message,
      typeof data === "object" && data?.description
        ? data.description
        : undefined,
      data,
    );
    return originalToast.error(message, data);
  };

  wrappedToast.info = (message: string, data?: any) => {
    logToast(
      "info",
      message,
      typeof data === "object" && data?.description
        ? data.description
        : undefined,
      data,
    );
    return originalToast.info(message, data);
  };

  wrappedToast.warning = (message: string, data?: any) => {
    logToast(
      "warning",
      message,
      typeof data === "object" && data?.description
        ? data.description
        : undefined,
      data,
    );
    return originalToast.warning(message, data);
  };

  // Copy all other properties from original toast
  return Object.assign(wrappedToast, originalToast);
};

const toast = createWrappedToast(sonnerToast);

export { toast, Toaster };
