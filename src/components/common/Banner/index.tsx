import { BannerProps } from '@/interfaces';
import BannerVariantA from './BannerVariantA';
import BannerVariantB from './BannerVariantB';

const Banner = (props: BannerProps) => {
  if (props.variant === 'VARIANT_A') {
    return <BannerVariantA {...props} />;
  } else if (props.variant === 'VARIANT_B') {
    return <BannerVariantB {...props} />;
  }

  return <></>;
};

export default Banner;
