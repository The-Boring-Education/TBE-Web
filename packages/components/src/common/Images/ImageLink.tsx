import { Image, Link } from '@tbe/components';
import type { ImageLinkProps } from '@tbe/interface';

const ImageLink = ({ linkProps, imageProps }: ImageLinkProps) => (
  <Link {...linkProps}>
    <Image {...imageProps} alt={imageProps.alt} />
  </Link>
);

export default ImageLink;
