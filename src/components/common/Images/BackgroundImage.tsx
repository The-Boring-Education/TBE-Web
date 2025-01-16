import { BackgroundImageProps } from '@/interfaces';

const BackgroundImage = ({
  bannerImageUrl,
  classNames = '',
}: BackgroundImageProps) => (
  <div
    className={`absolute inset-0 opacity-20 rounded-2 ${classNames} no-repeat bg-cover bg-center`}
    style={{
      backgroundImage: `url(${bannerImageUrl})`,
    }}
  ></div>
);

export default BackgroundImage;
