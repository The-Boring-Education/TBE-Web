import { Image, Text, FlexContainer } from '@/components';
import { PortfolioCardProps } from '@/interfaces';

const PortfolioCard = ({
  index,
  imageUrl,
  title,
  description,
}: PortfolioCardProps) => {
  return (
    <FlexContainer
      direction='col'
      itemCenter={false}
      className='w-full md:w-[48%] lg:w-[31%] border border-gray-300 p-3 gap-1 rounded-1'
    >
      <Text level='h1' className='text-5xl font-extrabold'>
        {index}.
      </Text>

      <div className='w-[40%]'>
        <Image
          alt={title}
          src={imageUrl}
          className='rounded-1 aspect-square my-1'
        />
      </div>

      <FlexContainer direction='col' itemCenter={false}>
        <Text level='h3' className='heading-4'>
          {title}
        </Text>
        <Text level='p' className='paragraph'>
          {description}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default PortfolioCard;
