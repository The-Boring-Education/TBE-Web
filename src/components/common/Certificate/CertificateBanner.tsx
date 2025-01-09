import React from 'react';
import { CertificateBannerProps } from '@/interfaces';

const CertificateBanner = ({
  backgroundColor,
  heading,
  subtext,
  icon,
  isLocked,
  onClick,
}: CertificateBannerProps) => {
  return (
    <div
      className={`${backgroundColor} text-white rounded-lg py-2 px-4 mt-2 shadow-lg flex items-center justify-between ${
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={!isLocked ? onClick : undefined}
    >
      <div>
        <h2 className='text-lg font-bold'>{heading}</h2>
        <p className='text-sm'>{subtext}</p>
      </div>
      <div className='text-2xl'>{icon && React.createElement(icon)} </div>
    </div>
  );
};

export default CertificateBanner;
