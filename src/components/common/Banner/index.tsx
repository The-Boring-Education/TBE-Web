import type { BannerProps } from '@/interfaces';

import BannerVariantA from './BannerVariantA';
import BannerVariantB from './BannerVariantB';
import BannerVariantC from './BannerVariantC';

const Banner = (props: BannerProps) => {
  if (props.variant === 'VARIANT_A') {
    return <BannerVariantA {...props} />;
  } else if (props.variant === 'VARIANT_B') {
    return <BannerVariantB {...props} />;
  } else if (props.variant === 'VARIANT_C') {
    return <BannerVariantC {...props} />;
  }

  return <></>;
};

export default Banner;
