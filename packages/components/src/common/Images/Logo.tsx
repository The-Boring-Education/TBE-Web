import { imageMeta } from '@tbe/constants';
import type { LogoProps } from '@tbe/interface';

import { Image, Link } from '../..';

const Logo = ({ className, isDark }: LogoProps) => (
  <Link className={`${className || ''} block relative`} href='/'>
    <span className='sr-only'>The Boring Education</span>
    <Image
      alt={imageMeta.logo.alt}
      className={className || ''}
      fullWidth={false}
      fullHeight={false}
      src={isDark ? imageMeta.logo.dark : imageMeta.logo.light}
    />
  </Link>
);

export default Logo;
