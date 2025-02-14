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
