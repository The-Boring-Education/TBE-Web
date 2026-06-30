import type { LoadingSpinnerProps } from "@tbe/interface";

const LoadingSpinner = ({
  className,
  height = 12,
  width = 12,
  marginClass = "ml-1",
  borderColour = "primary",
  fullPage = false,
  label,
}: LoadingSpinnerProps) => {
  const sizeClass = `h-${height} w-${width}`;
  const borderColourClass = `border-${borderColour}`;
  const appliedMargin = fullPage ? "" : marginClass;

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 ${borderColourClass} ${sizeClass} ${appliedMargin} ${className ?? ""}`.trim()}
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          {spinner}
          {label && <p className="mt-4 text-sm text-gray-500">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {spinner}
      {label && <p className="mt-2 text-sm text-gray-500">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
