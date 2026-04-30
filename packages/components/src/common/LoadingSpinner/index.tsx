import type { LoadingSpinnerProps } from "@tbe/interface";

const LoadingSpinner = ({
  className,
  height = 12,
  width = 12,
  marginClass = "",
  borderColour = "primary",
  fullPage = false,
  label,
}: LoadingSpinnerProps) => {
  const sizeClass = `h-${height} w-${width}`;
  const borderColourClass = `border-${borderColour}`;

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 ${borderColourClass} ${sizeClass} ${marginClass} ${className ?? ""}`}
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {spinner}
          {label && (
            <p className="mt-4 text-sm text-gray-500">{label}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {spinner}
      {label && (
        <p className="mt-2 text-sm text-gray-500">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
