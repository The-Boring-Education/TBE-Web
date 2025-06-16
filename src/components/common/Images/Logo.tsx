import { imageMeta } from '@/constant/global';
import type { LogoProps } from '@/interfaces';

import { Image, Link } from '../..';

const Logo = ({ className, isDark }: LogoProps) => (
    <Link className={className} href='/'>
      <span className='sr-only'>The Boring Education</span>
      <Image
        alt={imageMeta.logo.alt}
        className=''
        src={isDark ? imageMeta.logo.dark : imageMeta.logo.light}
      />
    </Link>
  );

export default Logo;
