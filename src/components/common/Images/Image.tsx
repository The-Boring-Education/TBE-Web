import { ImageContainerProps } from '@/interfaces';
import Image from 'next/image';

const ImageContainer = ({
  src,
  alt = '',
  className,
  loading = 'lazy',
  fullWidth = true,
  fullHeight = true,
}: ImageContainerProps) => {
  return (
    <div
      className={`${className} ${fullWidth && 'w-full'} ${
        fullHeight && 'h-full'
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill={true}
        loading={loading}
        className={`${className} image`}
      />
    </div>
  );
};

export default ImageContainer;
