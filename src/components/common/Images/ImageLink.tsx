import { Image, Link } from '@/components';
import type { ImageLinkProps } from '@/interfaces';

const ImageLink = ({ linkProps, imageProps }: ImageLinkProps) => (
    <Link {...linkProps}>
      <Image {...imageProps} alt={imageProps.alt} />
    </Link>
  );

export default ImageLink;
