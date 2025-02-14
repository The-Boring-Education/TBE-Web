import { Image, Text } from "@/components";
import { PrimaryLongCardProps } from "@/interfaces";
import Link from "next/link";

const PrimaryLongCard = ({
  image,
  imageAltText,
  title,
  href,
  
}: PrimaryLongCardProps) => {
  return (
    <div className="flex border-gray-900 md:w-3/4 mb-1 hover:bg-slate-200 rounded-lg">
      {href ? (
       <button>
          {/* Image Section */}
          <div className=" w-1/2 justify-center  flex-shrink-0">
            <div className="relative p-1 items-center aspect-video">
              <Image
                className="absolute inset-0 w-full h-full object-cover"
                src={image}
                alt={imageAltText}
              />
            </div>
          </div>
          {/* Text Section (next to the image) */}
          <div className="flex-grow p-1 text-start">
            <Text
              level="label"
              className="heading-4 font-semibold text-lg md:text-xl lg:text-2xl line-clamp-2"
            >
              {title}
            </Text>
          </div>
          </button>
      ) : (
        <div className="w-full max-w-[100%] mx-auto flex flex-row ">
          {/* Fixed Width Image Container */}
          <div className=" flex-1 w-64  max-w-60 md:h-32 relative">
            <Image
              src={image}
              alt={imageAltText}
              className="object-cover w-full h-auto rounded-md "
            />
          </div>
          {/* Text Container */}
          <div className="flex-1 p-2">
            <Text
              level="h6"
              className="heading-5 font-primary text-[1rem] md:text-[1.1rem] line-clamp-2"
            >
              {title}
            </Text>
          </div>
        </div>

      )}
    </div>
  );
};

export default PrimaryLongCard;
