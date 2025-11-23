import Image from 'next/image';

import type { ImageContainerProps } from '@tbe/interface';

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
    } relative`}
  >
    <Image
      alt={alt}
      className={`${className} image`}
      fill
      loading={loading}
      src={src}
      style={{ objectFit: 'cover' }}
    />
  </div>
);

export default ImageContainer;
