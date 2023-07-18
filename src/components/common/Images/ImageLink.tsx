import { Image, Link } from '@/components';
import { ImageLinkProps } from '@/interfaces';

const ImageLink = ({ linkProps, imageProps }: ImageLinkProps) => {
  return (
    <Link {...linkProps}>
      <Image {...imageProps} alt={imageProps.alt} />
    </Link>
  );
};

export default ImageLink;
