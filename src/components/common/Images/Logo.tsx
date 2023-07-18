import { imageMeta } from '@/constant/global';
import { LogoProps } from '@/interfaces';
import { Image, Link } from '../..';

const Logo = ({ className, isDark }: LogoProps) => {
  return (
    <Link href='/' className={className}>
      <span className='sr-only'>The Boring Education</span>
      <Image
        className=''
        src={isDark ? imageMeta.logo.dark : imageMeta.logo.light}
        alt={imageMeta.logo.alt}
      />
    </Link>
  );
};

export default Logo;
