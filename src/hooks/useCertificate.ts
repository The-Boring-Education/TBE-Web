import { useRef } from 'react';
import { toPng } from 'html-to-image';
import useUser from './useUser';
import { useAnalytics } from '@/hooks';

const useCertificate = () => {
  const { user } = useUser();
  const { trackEvent } = useAnalytics();

  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (label: string) => {
    if (!user) return;
    if (certificateRef.current) {
      try {
        trackEvent({
          action: 'CERTIFICATE_DOWNLOAD',
          category: 'User',
          label: 'Certificate Download',
          value: {
            user: user.name,
            certificate: label,
          },
        });

        const dataUrl = await toPng(certificateRef.current, { quality: 1 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${user.name}-${label}-certificate.png`;
        link.click();
      } catch (error) {
        console.error('Error generating certificate image:', error);
      }
    }
  };

  return {
    certificateRef,
    handleDownload,
  };
};

export default useCertificate;
