import { useRef } from 'react';
import { toPng } from 'html-to-image';
import useUser from './useUser';

export const useCertificate = () => {
  const { user } = useUser();

  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (label: string) => {
    if (!user) return;
    if (certificateRef.current) {
      try {
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
