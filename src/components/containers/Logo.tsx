import { imageMeta } from '@/constant/global';
import { LogoProps } from '@/interfaces';
import { Image, Link } from '..';

const Logo = ({ className }: LogoProps) => {
  return (
    <Link href='/' className={className + ' m-1.5 p-1.5'}>
      <span className='sr-only'>The Boring Education</span>
      <Image className='' src={imageMeta.logo.path} alt={imageMeta.logo.alt} />
    </Link>
  );
};

export default Logo;
