import { Image } from "@tbe/components";
import type { WeTaughtAtCardProps } from "@tbe/interface";

const WeTaughtAtCard = ({ image, imageAltText }: WeTaughtAtCardProps) => (
  <div className="flex">
    <Image
      alt={imageAltText}
      className="w-24 md:w-48"
      fullWidth={false}
      src={image}
    />
  </div>
);

export default WeTaughtAtCard;
