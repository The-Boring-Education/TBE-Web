import { Image } from '@/components';
import { WeTaughtAtCardProps } from '@/interfaces';

const WeTaughtAtCard = ({ image, imageAltText }: WeTaughtAtCardProps) => {
  return (
    <div className='flex'>
      <Image
        src={image}
        className='w-24 md:w-48'
        fullWidth={false}
        alt={imageAltText}
      />
    </div>
  );
};

export default WeTaughtAtCard;
