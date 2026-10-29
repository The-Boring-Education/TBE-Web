import React from "react";

export interface LearnButtonProps {
  children?: React.ReactNode;
  isCompleted?: boolean;
  completedLabel?: string;
  incompleteLabel?: string;
  variant?: "primary" | "secondary" | "outline" | "completed" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const LearnButton: React.FC<LearnButtonProps> = ({
  children,
  isCompleted = false,
  completedLabel,
  incompleteLabel,
  variant = "primary",
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const isToggle =
    completedLabel !== undefined || incompleteLabel !== undefined;
  const currentCompleted = isToggle ? isCompleted : variant === "completed";

  let variantClasses = "bg-[#FF4D4D] hover:bg-[#EE3126] text-white shadow-2xs";

  if (currentCompleted) {
    variantClasses =
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs";
  } else if (variant === "outline" || variant === "secondary") {
    variantClasses =
      "bg-white dark:bg-[#1E1E24] border border-slate-200/90 dark:border-[#2C2C34] text-[#101828] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#282830] shadow-2xs";
  } else if (variant === "ghost") {
    variantClasses =
      "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#202026]";
  }

  const displayText = isToggle
    ? isCompleted
      ? completedLabel || "Solved"
      : incompleteLabel || "Mark as Solved"
    : children;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 mr-2" />
      ) : null}
      <span className="whitespace-nowrap">{displayText}</span>
    </button>
  );
};
