import React from "react";

interface ProductLogoProps {
  productName: string;
  subText?: string;
  className?: string;
  onClick?: () => void;
}

const ProductLogo = ({
  productName,
  subText = "By The Boring Education",
  className = "",
  onClick,
}: ProductLogoProps) => {
  return (
    <div
      className={`flex flex-col gap-0 select-none cursor-pointer ${className}`}
      onClick={onClick}
    >
      <span className="text-2xl font-bold text-primary leading-tight">
        {productName}
      </span>
      <span className="text-[10px] text-greyDark dark:text-gray-400 -mt-0.5">
        {subText}
      </span>
    </div>
  );
};

export default ProductLogo;
