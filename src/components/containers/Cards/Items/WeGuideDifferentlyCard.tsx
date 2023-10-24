import { GradientContainer, Image, Text } from '@/components';
import { WeGuideDifferentlyCardProps } from '@/interfaces';

const WeGuideDifferentlyCard = ({
  image,
  imageAltText,
  title,
  content,
}: WeGuideDifferentlyCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor5'>
      <Image
        className='h-40 w-48'
        src={`${image}`}
        fullHeight={false}
        fullWidth={false}
        alt={imageAltText}
      />
      <Text level='h4' className='heading-4 mt-4'>
        {title}
      </Text>

      <Text level='p' className='paragraph mt-1 text-greyDark'>
        {content}
      </Text>
    </GradientContainer>
  );
};

export default WeGuideDifferentlyCard;
