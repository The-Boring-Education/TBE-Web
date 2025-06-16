import { FlexContainer, Image, Text } from '@/components';
import type { PortfolioCardProps } from '@/interfaces';

const PortfolioCard = ({
  index,
  imageUrl,
  title,
  description,
}: PortfolioCardProps) => (
    <FlexContainer
      className='w-full md:w-[48%] lg:w-[31%] border border-gray-300 p-3 gap-1 rounded-1'
      direction='col'
      itemCenter={false}
    >
      <Text className='text-5xl font-extrabold' level='h1'>
        {index}.
      </Text>

      <div className='w-[40%]'>
        <Image
          alt={title}
          className='rounded-1 aspect-square my-1'
          src={imageUrl}
        />
      </div>

      <FlexContainer direction='col' itemCenter={false}>
        <Text className='heading-4' level='h3'>
          {title}
        </Text>
        <Text className='paragraph' level='p'>
          {description}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );

export default PortfolioCard;
