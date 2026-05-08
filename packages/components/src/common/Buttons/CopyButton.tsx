import { useCopyLink } from "@tbe/hooks";
import type { CopyButtonProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { Copy } from "lucide-react";

import Button from "./Button";

const CopyButton = ({
  value,
  text = "Copy Link",
  copiedText = "Copied!",
  copiedClassName = "",
  resetAfterMs = 2000,
  onCopySuccess,
  onCopyError,
  variant = "OUTLINE",
  className = "",
  active = true,
  isLoading = false,
  animationClasses = "",
  isFullWidth = false,
  animationType = "DEFAULT",
  size = "SMALL",
  type = "button",
}: CopyButtonProps) => {
  const { copied, copyLink } = useCopyLink({
    resetAfterMs,
    onCopySuccess,
    onCopyError,
  });

  const handleCopy = () => {
    void copyLink(value);
  };

  return (
    <Button
      variant={variant}
      className={cn(className, copied && copiedClassName)}
      text={copied ? copiedText : text}
      active={active}
      isLoading={isLoading}
      onClick={handleCopy}
      animationClasses={animationClasses}
      icon={<Copy className="h-2 w-2 ml-1 opacity-80" aria-hidden />}
      isFullWidth={isFullWidth}
      animationType={animationType}
      size={size}
      type={type}
    />
  );
};

export default CopyButton;
