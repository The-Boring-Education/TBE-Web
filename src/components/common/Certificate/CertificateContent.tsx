import React from 'react';
import { CertificateContentProps } from '@/interfaces';

const CertificateContent = ({
  type,
  userName,
  courseName,
  date,
}: CertificateContentProps) => {
  const backgroundImagePaths: Record<string, string> = {
    WEBINAR: 'url(/images/webinar_certificate.png)',
    SHIKSHA: 'url(/images/shiksha_certificate.png)',
  };

  const userNameStyles: React.CSSProperties = {
    top: '51.5%',
    left: '50%',
    transform:
      type === 'SHIKSHA' ? 'translate(-50%, -160%)' : 'translate(-50%,-160%)',
    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    opacity: '0.8',
  };

  const courseNameStyles: React.CSSProperties = {
    top: '59%',
    left: '50%',
    transform:
      type === 'SHIKSHA' ? 'translate(-50%,-100%)' : 'translate(-50%,-140%)',
    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  const dateStyles: React.CSSProperties = {
    top: '67%',
    left: '50%',
    transform:
      type === 'SHIKSHA' ? 'translate(-50%,-110%)' : 'translate(-50%,-180%)',
    fontSize: 'clamp(0.6rem, 1.5vw, 1rem)',
    fontWeight: 500,
    opacity: '0.85',
  };

  return (
    <div
      className='certificate-container relative rounded-lg shadow-lg'
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '600px',
        margin: 'auto',
        aspectRatio: '1',
        backgroundImage: backgroundImagePaths[type],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <div className='absolute' style={userNameStyles}>
        {userName}
      </div>
      <div className='absolute' style={courseNameStyles}>
        {courseName}
      </div>
      <div className='absolute' style={dateStyles}>
        {date}
      </div>
    </div>
  );
};

export default CertificateContent;
