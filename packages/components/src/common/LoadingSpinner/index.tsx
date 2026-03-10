import type { LoadingSpinnerProps } from "@tbe/interface";

const LoadingSpinner = ({
  className,
  height = 12,
  width = 12,
  marginClass = "ml-1",
  borderColour = "black",
}: LoadingSpinnerProps) => {
  let additionalClasses = "";
  if (height) additionalClasses += `h-${height} `;
  if (width) additionalClasses += `w-${width} `;
  if (marginClass) additionalClasses += marginClass;
  if (className) additionalClasses += className;
  const borderColourClass = `border-${borderColour}`;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`inline-block ${additionalClasses} ${marginClass} animate-spin rounded-full border-2 border-solid ${borderColourClass} border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      />
    </div>
  );
};

export default LoadingSpinner;
