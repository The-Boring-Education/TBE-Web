import type { GradientContainerProps } from "@tbe/interface";

// To Put Border Color => border-borderColor${variant}
const GradientContainer = ({
  children,
  className = "",
  backgroundColor,
  childrenClassName = "p-3",
  theme = "light",
  suppressHoverScale = false,
}: GradientContainerProps) => (
  <div
    className={`flex-auto rounded-2 border border-border dark:border-white/10 ${className} ${
      backgroundColor ??
      (theme === "dark" ? "bg-[#111115]" : "bg-white dark:bg-[#121215]")
    } hover:shadow-2xl
      transition-all duration-300 ${suppressHoverScale ? "" : "hover:scale-105"}`}
  >
    <div className={`rounded-2 ${childrenClassName}`}>{children}</div>
  </div>
);

export default GradientContainer;
