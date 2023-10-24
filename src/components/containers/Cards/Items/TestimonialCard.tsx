import { GradientContainer, Image, Text } from '@/components';
import { TestimonialCardProps } from '@/interfaces';

const TestimonialCard = ({
  image,
  imageAltText,
  title,
  content,
  work,
}: TestimonialCardProps) => {
  return (
    <GradientContainer className='max-w-sm border-borderColor3'>
      <Image
        className='h-12 w-12 rounded-full border object-cover'
        fullWidth={false}
        src={`${image}`}
        alt={imageAltText}
      />
      <Text level='p' className='paragraph mt-2 font-medium'>
        {title}
      </Text>
      <Text level='p' className='paragraph mt-1'>
        {content}
      </Text>
      <Text level='p' className='paragraph span mt-2 text-secondary'>
        {work}
      </Text>
    </GradientContainer>
  );
};

export default TestimonialCard;
