import Image from 'next/image';

import type { ImageContainerProps } from '@/interfaces';

const ImageContainer = ({
  src,
  alt = '',
  className,
  loading = 'lazy',
  fullWidth = true,
  fullHeight = true,
}: ImageContainerProps) => (
  <div
    className={`${className} ${fullWidth && 'w-full'} ${
      fullHeight && 'h-full'
    }`}
  >
    <Image
      alt={alt}
      className={`${className} image`}
      fill
      loading={loading}
      src={src}
    />
  </div>
);

export default ImageContainer;
