import { Image } from '@/components';
import type { WeTaughtAtCardProps } from '@/interfaces';

const WeTaughtAtCard = ({ image, imageAltText }: WeTaughtAtCardProps) => (
  <div className='flex'>
    <Image
      alt={imageAltText}
      className='w-24 md:w-48'
      fullWidth={false}
      src={image}
    />
  </div>
);

export default WeTaughtAtCard;
