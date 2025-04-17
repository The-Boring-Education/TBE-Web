import { CertificateContentProps } from '@/interfaces';

const CertificateContent = ({
  type,
  userName,
  courseName,
  date,
  certificateRef,
}: CertificateContentProps) => {
  const backgroundImagePaths: Record<string, string> = {
    WEBINAR: 'url(/images/webinar_certificate.png)',
    SHIKSHA: 'url(/images/shiksha_certificate.png)',
  };

  return (
    <div
      className='certificate-container relative rounded-lg shadow-lg'
      ref={certificateRef}
      style={{
        width: '100%',
        height: '100%',
        margin: 'auto',
        aspectRatio: '1',
        backgroundImage: backgroundImagePaths[type],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <div className='absolute certificate-userName'>{userName}</div>
      <div className='absolute certificate-coursename'>{courseName}</div>
      <div className='absolute certificate-date'>{date}</div>
    </div>
  );
};

export default CertificateContent;
