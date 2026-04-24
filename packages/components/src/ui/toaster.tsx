import { useToast } from "@tbe/hooks";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(
        ({ id, title, description, action, variant, ...restProps }) => {
          const mappedVariant =
            variant === "destructive" ? "destructive" : "default";
          return (
            <Toast key={id} variant={mappedVariant} {...restProps}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        },
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
