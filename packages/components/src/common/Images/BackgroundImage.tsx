import type { BackgroundImageProps } from "@tbe/interface";

const BackgroundImage = ({
  bannerImageUrl,
  classNames = "",
}: BackgroundImageProps) => (
  <div
    className={`absolute inset-0 opacity-20 rounded-2 ${classNames} no-repeat bg-cover bg-center`}
    style={{
      backgroundImage: `url(${bannerImageUrl})`,
    }}
  />
);

export default BackgroundImage;
